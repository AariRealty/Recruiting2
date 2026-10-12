const Stripe = require('stripe');
const { PROMO_RULES, SUPABASE_ANON_PUBLIC } = require('./_pricing');
const { lookupAffiliation } = require('./_affiliation');

// Live recurring prices (Aari Realty, acct_1Qo5qRHTQU4zpF23)
const PLAN_MAP = {
  'Aari Mentorship 75/25': { price: 'price_1TrolCHTQU4zpF23sVKjtlYr', portal: 'Mentorship Path' },
  'Aari Growth 85/15': { price: 'price_1TrolKHTQU4zpF231UVO8zmQ', portal: 'Aari Growth' },
  'Aari Max 100%': { price: 'price_1TrolMHTQU4zpF23lzz3Zpwi', portal: 'Aari Max' }
};
const EO_PRICE = 'price_1TrolNHTQU4zpF236LAkKbqi';

const PROVISION_URL = 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/functions/v1/realty-agent-provision';
const SUPABASE_ANON = SUPABASE_ANON_PUBLIC;
const PROVISION_TOKEN = 'aari-provision-b7Q2xM9';

// Today's date in Florida (America/New_York) as YYYY-MM-DD.
function todayFL() { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
// First Monthly Brokerage Fee: the 1st of the month after the Associate's Start Date
// (Exhibit A 41.1, Manual 68.1). A missing, invalid or past Start Date falls back to today.
// A Start Date more than one year out is capped at one year.
function firstOfMonthAfterStartTs(startISO) {
  const today = todayFL();
  let start = /^\d{4}-\d{2}-\d{2}$/.test(String(startISO || '')) ? String(startISO) : today;
  if (start < today) start = today;
  const t = new Date(today + 'T12:00:00Z'); const cap = new Date(Date.UTC(t.getUTCFullYear() + 1, t.getUTCMonth(), t.getUTCDate(), 12)).toISOString().slice(0, 10);
  if (start > cap) start = cap;
  const y = Number(start.slice(0, 4)), m = Number(start.slice(5, 7));
  return Math.floor(Date.UTC(y, m, 1, 12, 0, 0) / 1000);
}
function firstOfNextMonthNextYearTs() {
  const now = new Date();
  return Math.floor(Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth() + 1, 1, 12, 0, 0) / 1000);
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_ANON) {
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
    const startDate = String(body.start_date || '').trim();
    let affiliation = String(body.affiliation_status || 'new').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email is required' });
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const planInfo = PLAN_MAP[planName] || null;
    const out = { ok: true, subscriptions: {}, account: null, warnings: [] };

    // 0) Recurring billing starts only for a payment or card setup that succeeded for this same email.
    const verifyId = String(body.payment_id || '').trim();
    if (!/^(pi|seti)_/.test(verifyId)) return res.status(400).json({ error: 'payment_required' });
    let verified = null;
    try {
      verified = verifyId.indexOf('seti_') === 0 ? await stripe.setupIntents.retrieve(verifyId) : await stripe.paymentIntents.retrieve(verifyId);
    } catch (e) { return res.status(400).json({ error: 'payment_not_found' }); }
    if (!verified || verified.status !== 'succeeded') return res.status(409).json({ error: 'payment_not_succeeded', status: verified && verified.status });
    const verifiedEmail = String(((verified.metadata || {}).agent_email) || '').trim().toLowerCase();
    if (verifiedEmail !== email) return res.status(403).json({ error: 'payment_email_mismatch' });

    // 1) Find the Stripe customer created at checkout (most recent for this email)
    let customer = null;
    try {
      const custId = typeof verified.customer === 'string' ? verified.customer : (verified.customer && verified.customer.id);
      if (custId) customer = await stripe.customers.retrieve(custId);
      else { const list = await stripe.customers.list({ email: email, limit: 3 }); customer = (list.data && list.data[0]) || null; }
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

    // 2b) Billing history decides affiliation, not the form (decision #75). Runs before any new subscription exists.
    let detected = null;
    try { detected = await lookupAffiliation(stripe, email); } catch (e) { out.warnings.push('affiliation_lookup: ' + String(e.message || e).slice(0, 120)); }
    if (detected === 'returning' && affiliation !== 'returning') { out.warnings.push('affiliation set to returning from billing history'); affiliation = 'returning'; }
    out.affiliation = affiliation;
    if (detected === 'current' || detected === 'review') {
      out.warnings.push('CURRENT AGENT went through checkout: no new subscriptions created; broker to review the payment');
      out.affiliation = 'current';
    }

    // 3) Monthly plan subscription, first charge on the 1st of the month after the Start Date (the Start Date month is free)
    if (customer && pmId && planInfo && detected !== 'current' && detected !== 'review') {
      try {
        // Manual 68.1: the Start Date month is waived only on a first affiliation. A returning Associate
        // pays it with the first Monthly Brokerage Fee on the 1st after the Start Date, never at signup (decision #78).
        const monthly = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: planInfo.price }],
          trial_end: firstOfMonthAfterStartTs(startDate),
          proration_behavior: 'none',
          default_payment_method: pmId,
          metadata: { kind: 'agent_membership_monthly', email: email, full_name: fullName, plan: planInfo.portal, start_date: startDate || '', affiliation: affiliation }
        }, { idempotencyKey: 'aari-monthly:' + email });
        out.subscriptions.monthly = monthly.id;
        if (affiliation === 'returning') {
          try {
            const pr = await stripe.prices.retrieve(planInfo.price);
            // A pending item tied to the subscription is billed on its next invoice: the 1st after the Start Date.
            await stripe.invoiceItems.create({
              customer: customer.id,
              subscription: monthly.id,
              price_data: { currency: pr.currency, product: typeof pr.product === 'string' ? pr.product : pr.product.id, unit_amount: pr.unit_amount },
              description: 'Start Date month, returning Associate (Manual 68.1)'
            }, { idempotencyKey: 'aari-startmonth:' + email + ':' + monthly.id });
            out.start_month_billed_with_first_fee = true;
          } catch (e) { out.warnings.push('start_month_item: ' + String(e.message || e).slice(0, 140)); }
        }
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

    // 4b) Record a promo spot (Exhibit A 41.3) only once the payment or card setup succeeded.
    try {
      const intentId = String(body.payment_id || '').trim();
      if (intentId) {
        const intent = intentId.indexOf('seti_') === 0
          ? await stripe.setupIntents.retrieve(intentId)
          : await stripe.paymentIntents.retrieve(intentId);
        const code = String((intent.metadata && intent.metadata.coupon) || '').toUpperCase();
        if (intent.status === 'succeeded' && PROMO_RULES[code]) {
          const r = await fetch('https://fnlrgmuvtgwzjsihqxcn.supabase.co/rest/v1/rpc/promo_record', {
            method: 'POST',
            headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_code: code, p_intent_id: intentId, p_email: intent.metadata.agent_email || email, p_amount: Math.round(Number(intent.metadata.discount) || 0), p_max: PROMO_RULES[code].maxRedemptions })
          });
          out.promo = await r.json().catch(function () { return { ok: false }; });
        }
      }
    } catch (e) { out.warnings.push('promo_record: ' + String(e.message || e).slice(0, 140)); }

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
