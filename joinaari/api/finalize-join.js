const Stripe = require('stripe');

// Live recurring prices (Aari Realty, acct_1Qo5qRHTQU4zpF23)
const PLAN_MAP = {
  'Aari Mentorship 75/25': { price: 'price_1TrolCHTQU4zpF23sVKjtlYr', portal: 'Mentorship Path' },
  'Aari Growth 85/15': { price: 'price_1TrolKHTQU4zpF231UVO8zmQ', portal: 'Aari Growth' },
  'Aari Max 100%': { price: 'price_1TrolMHTQU4zpF23lzz3Zpwi', portal: 'Aari Max' }
};
const EO_PRICE = 'price_1TrolNHTQU4zpF236LAkKbqi';

const PROVISION_URL = 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/functions/v1/realty-agent-provision';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;
const PROVISION_TOKEN = process.env.PROVISION_TOKEN;

function firstOfNextMonthTs() {
  const now = new Date();
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 12, 0, 0) / 1000);
}
function firstOfNextMonthNextYearTs() {
  const now = new Date();
  return Math.floor(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth() + 1, 1, 12, 0, 0) / 1000);
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_ANON || !PROVISION_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const allowed = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', allowed.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    // Accept the same fields the signing/copy call already sends.
    const email = String(body.email || '').trim().toLowerCase();
    const planName = String(body.plan || body.plan_name || '').trim();
    const fullName = String(body.name || ((body.first_name || '') + ' ' + (body.last_name || ''))).trim();
    const phone = String(body.phone || '').trim();
    const license = String(body.license || body.license_number || '').trim();
    if (!email) return res.status(400).json({ error: 'email is required' });
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const planInfo = PLAN_MAP[planName] || null;
    const out = { ok: true, subscriptions: {}, account: null, warnings: [] };

    // 1) Find the Stripe customer created at checkout (most recent for this email)
    let customer = null;
    try {
      const list = await stripe.customers.list({ email: email, limit: 3 });
      customer = (list.data && list.data[0]) || null;
    } catch (e) { out.warnings.push('customer_lookup: ' + String(e.message || e).slice(0, 120)); }

    let pmId = null;
    if (customer) {
      pmId = customer.invoice_settings && customer.invoice_settings.default_payment_method;
      if (!pmId) {
        try {
          const pms = await stripe.paymentMethods.list({ customer: customer.id, type: 'card', limit: 1 });
          pmId = pms.data && pms.data[0] && pms.data[0].id;
        } catch (e) { out.warnings.push('pm_lookup: ' + String(e.message || e).slice(0, 120)); }
      }
    }

    // 2) Set the saved card as the customer default so recurring charges use it
    if (customer && pmId) {
      try { await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pmId } }); }
      catch (e) { out.warnings.push('default_pm: ' + String(e.message || e).slice(0, 120)); }
    }

    // 3) Monthly plan subscription, first charge on the 1st of next month (prorated first month already collected today)
    if (customer && pmId && planInfo) {
      try {
        const monthly = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: planInfo.price }],
          trial_end: firstOfNextMonthTs(),
          proration_behavior: 'none',
          default_payment_method: pmId,
          metadata: { kind: 'agent_membership_monthly', email: email, full_name: fullName, plan: planInfo.portal }
        }, { idempotencyKey: 'aari-monthly:' + email });
        out.subscriptions.monthly = monthly.id;
      } catch (e) { out.warnings.push('monthly_sub: ' + String(e.message || e).slice(0, 140)); }

      // 4) Annual E&O subscription, first renewal one year out (year one collected today)
      try {
        const eo = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: EO_PRICE }],
          trial_end: firstOfNextMonthNextYearTs(),
          proration_behavior: 'none',
          default_payment_method: pmId,
          metadata: { kind: 'agent_eo_annual', email: email, full_name: fullName }
        }, { idempotencyKey: 'aari-eo:' + email });
        out.subscriptions.eo = eo.id;
      } catch (e) { out.warnings.push('eo_sub: ' + String(e.message || e).slice(0, 140)); }
    } else {
      out.warnings.push('missing customer, payment method, or plan; subscriptions skipped');
    }

    // 5) Create the agent's Agent Hub portal account (temp password + welcome email). Idempotent by email.
    try {
      const r = await fetch(PROVISION_URL, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: PROVISION_TOKEN, email: email, full_name: fullName, license_number: license, plan: planInfo ? planInfo.portal : '', phone: phone })
      });
      out.account = await r.json().catch(function () { return { ok: false }; });
    } catch (e) { out.warnings.push('provision: ' + String(e.message || e).slice(0, 140)); }

    return res.status(200).json(out);
  } catch (err) {
    console.error('finalize-join error:', err);
    return res.status(500).json({ error: 'finalize failed' });
  }
};
