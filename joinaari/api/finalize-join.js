const Stripe = require('stripe');

// Live recurring prices (Aari Realty, acct_1Qo5qRHTQU4zpF23)
const PLAN_MAP = {
  'Aari Mentorship 75/25': { price: 'price_1TrolCHTQU4zpF23sVKjtlYr', portal: 'Mentorship Path' },
  'Aari Growth 85/15': { price: 'price_1TrolKHTQU4zpF231UVO8zmQ', portal: 'Aari Growth' },
  'Aari Max 100%': { price: 'price_1TrolMHTQU4zpF23lzz3Zpwi', portal: 'Aari Max' }
};
const EO_PRICE = 'price_1TrolNHTQU4zpF236LAkKbqi';

const PROVISION_URL = 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/functions/v1/realty-agent-provision';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubHJnbXV2dGd3empzaWhxeGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODUxNDMsImV4cCI6MjA5Mzk2MTE0M30.C2-9M_OBuDLDDzr6g3DqisZ9OPDoFoKY7uQb7EsgG_Y';
const PROVISION_TOKEN = 'aari-provision-b7Q2xM9';

function firstOfNextMonthTs() {
  const now = new Date();
  const ts = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 12, 0, 0);
  return Math.floor(ts / 1000);
}
function firstOfNextMonthNextYearTs() {
  const now = new Date();
  const ts = Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth() + 1, 1, 12, 0, 0);
  return Math.floor(ts / 1000);
}

module.exports = async function handler(req, res) {
  const allowed = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', allowed.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { payment_intent_id, plan_name, first_name, last_name, email, phone, license_number } = req.body || {};
    if (!payment_intent_id || !email) return res.status(400).json({ error: 'payment_intent_id and email are required' });
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const planInfo = PLAN_MAP[plan_name] || null;
    const fullName = ((first_name || '') + ' ' + (last_name || '')).trim();

    const out = { ok: true, subscriptions: {}, account: null, warnings: [] };

    // 1) Retrieve the PaymentIntent to get customer + saved card
    let pi;
    try {
      pi = await stripe.paymentIntents.retrieve(payment_intent_id, { expand: ['payment_method', 'customer'] });
    } catch (e) {
      return res.status(400).json({ error: 'could not retrieve payment intent: ' + String(e.message || e).slice(0, 140) });
    }
    const customerId = typeof pi.customer === 'string' ? pi.customer : (pi.customer && pi.customer.id);
    const pmId = typeof pi.payment_method === 'string' ? pi.payment_method : (pi.payment_method && pi.payment_method.id);

    // 2) Set the saved card as the customer's default (so recurring charges use it)
    if (customerId && pmId) {
      try {
        await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: pmId } });
      } catch (e) { out.warnings.push('default_pm: ' + String(e.message || e).slice(0, 120)); }
    }

    // 3) Monthly plan subscription, first charge on the 1st of next month (prorated first month already collected today)
    if (customerId && pmId && planInfo) {
      try {
        const monthly = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: planInfo.price }],
          trial_end: firstOfNextMonthTs(),
          proration_behavior: 'none',
          default_payment_method: pmId,
          metadata: { kind: 'agent_membership_monthly', email: email, full_name: fullName, plan: planInfo.portal }
        }, { idempotencyKey: payment_intent_id + ':monthly' });
        out.subscriptions.monthly = monthly.id;
      } catch (e) { out.warnings.push('monthly_sub: ' + String(e.message || e).slice(0, 140)); }

      // 4) Annual E&O subscription, first renewal one year out (year one collected today)
      try {
        const eo = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: EO_PRICE }],
          trial_end: firstOfNextMonthNextYearTs(),
          proration_behavior: 'none',
          default_payment_method: pmId,
          metadata: { kind: 'agent_eo_annual', email: email, full_name: fullName }
        }, { idempotencyKey: payment_intent_id + ':eo' });
        out.subscriptions.eo = eo.id;
      } catch (e) { out.warnings.push('eo_sub: ' + String(e.message || e).slice(0, 140)); }
    } else {
      out.warnings.push('missing customer, payment method, or plan; subscriptions skipped');
    }

    // 5) Create the agent's Agent Hub portal account (temp password + welcome email)
    try {
      const r = await fetch(PROVISION_URL, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: PROVISION_TOKEN, email: email, full_name: fullName, license_number: license_number || '', plan: planInfo ? planInfo.portal : '', phone: phone || '' })
      });
      out.account = await r.json().catch(function () { return { ok: false }; });
    } catch (e) { out.warnings.push('provision: ' + String(e.message || e).slice(0, 140)); }

    return res.status(200).json(out);
  } catch (err) {
    console.error('finalize-join error:', err);
    return res.status(500).json({ error: 'finalize failed' });
  }
};
