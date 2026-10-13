const Stripe = require('stripe');
const { PROMO_RULES, SUPABASE_ANON_PUBLIC } = require('./_pricing');
const { lookupAffiliationDetail } = require('./_affiliation');

// Live recurring prices (Aari Realty, acct_1Qo5qRHTQU4zpF23)
const PLAN_MAP = {
  'Aari Mentorship 75/25': { price: 'price_1TrolCHTQU4zpF23sVKjtlYr', portal: 'Mentorship Path' },
  'Aari Growth 85/15': { price: 'price_1TrolKHTQU4zpF231UVO8zmQ', portal: 'Aari Growth' },
  'Aari Max 100%': { price: 'price_1TrolMHTQU4zpF23lzz3Zpwi', portal: 'Aari Max' }
};
const EO_PRICE = 'price_1TrolNHTQU4zpF236LAkKbqi';

const SUPABASE_ANON = SUPABASE_ANON_PUBLIC;

// Today's date in Florida (America/New_York) as YYYY-MM-DD.
function todayFL() { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
// Decisions 100 to 103 (12 Oct 2026), Manual 68.1 and Exhibit A 41: fees run on the Associate's own day.
// New and returning Associates: the E&O + Compliance Fee is charged at signing; the first Monthly
// Brokerage Fee is charged on the Start Date and then on that day each month; the E&O renews on the
// Start Date each year. A missing, invalid, past or same day Start Date becomes tomorrow; more than one year
// out is capped at one year.
function clampStartISO(startISO) {
  const today = todayFL();
  // Decision 139: never signing day. A missing, invalid, past or same day Start Date becomes tomorrow,
  // so a new or returning Associate is charged only the E&O + Compliance Fee at signing.
  const tm = new Date(today + 'T12:00:00Z'); tm.setUTCDate(tm.getUTCDate() + 1); const tomorrow = tm.toISOString().slice(0, 10);
  let start = /^\d{4}-\d{2}-\d{2}$/.test(String(startISO || '')) ? String(startISO) : tomorrow;
  if (start < tomorrow) start = tomorrow;
  const t = new Date(today + 'T12:00:00Z');
  const cap = new Date(Date.UTC(t.getUTCFullYear() + 1, t.getUTCMonth(), t.getUTCDate(), 12)).toISOString().slice(0, 10);
  if (start > cap) start = cap;
  return start;
}
function isoNoonTs(iso) { return Math.floor(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)), 16, 0, 0) / 1000); }
function daysIn(y, m0) { return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate(); }
// Monthly fee for a new or returning Associate: null means charge now (Start Date is today).
function monthlyStartTs(startISO) {
  const s = clampStartISO(startISO);
  return s === todayFL() ? null : isoNoonTs(s);
}
// E&O renewal for a new or returning Associate: one year after the Start Date (year one paid at signing).
function eoRenewalTs(startISO) {
  const s = clampStartISO(startISO);
  const y = Number(s.slice(0, 4)) + 1, m0 = Number(s.slice(5, 7)) - 1, d = Math.min(Number(s.slice(8, 10)), daysIn(y, m0));
  return Math.floor(Date.UTC(y, m0, d, 16, 0, 0) / 1000);
}
// Current Associates (decision 103): nothing is charged when they sign in the Hub. The monthly fee is
// charged on the day of the month they originally joined, starting the next time that day comes around.
// Decision 108: a fee prepaid through a date (paidThroughISO) starts the first charge after that date.
function nextMonthDayTs(joinISO, paidThroughISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(joinISO || ''))) return null;
  const today = todayFL(); const pt = String(paidThroughISO || '');
  const t = (/^\d{4}-\d{2}-\d{2}$/.test(pt) && pt > today) ? pt : today; let y = Number(t.slice(0, 4)), m0 = Number(t.slice(5, 7)) - 1; const td = Number(t.slice(8, 10));
  const jd = Number(String(joinISO).slice(8, 10));
  let d = Math.min(jd, daysIn(y, m0));
  if (d <= td) { m0 += 1; if (m0 > 11) { m0 = 0; y += 1; } d = Math.min(jd, daysIn(y, m0)); }
  return Math.floor(Date.UTC(y, m0, d, 16, 0, 0) / 1000);
}
// Current Associates: the E&O renews on the next anniversary of the original join date (the date itself).
function nextAnniversaryTs(joinISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(joinISO || ''))) return null;
  const t = todayFL(); let y = Number(t.slice(0, 4));
  const m0 = Number(String(joinISO).slice(5, 7)) - 1, jd = Number(String(joinISO).slice(8, 10));
  let d = Math.min(jd, daysIn(y, m0));
  const iso = (yy, dd) => yy + '-' + String(m0 + 1).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
  if (iso(y, d) <= t) { y += 1; d = Math.min(jd, daysIn(y, m0)); }
  return Math.floor(Date.UTC(y, m0, d, 16, 0, 0) / 1000);
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

    // Decision 103a: a past due fee paid on the card step is marked collected in the Hub record.
    const vmeta = verified.metadata || {};
    if (vmeta.kind === 'eo_arrears' && /^[0-9a-f-]{36}$/i.test(String(vmeta.invite_token || ''))) {
      try {
        await fetch('https://fnlrgmuvtgwzjsihqxcn.supabase.co/rest/v1/rpc/mark_arrears_collected', {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_token: vmeta.invite_token, p_payment_id: verified.id })
        });
      } catch (e) { out.warnings.push('arrears_mark: ' + String(e.message || e).slice(0, 120)); }
    }
    // Decision 122: same mark when the past due fee was paid on joinaari.com (keyed by the signature id).
    else if (vmeta.kind === 'eo_arrears' && /^[0-9a-f-]{36}$/i.test(String(vmeta.sig_id || ''))) {
      try {
        await fetch('https://fnlrgmuvtgwzjsihqxcn.supabase.co/rest/v1/rpc/mark_arrears_collected_sig', {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_sig: vmeta.sig_id, p_payment_id: verified.id })
        });
      } catch (e) { out.warnings.push('arrears_mark: ' + String(e.message || e).slice(0, 120)); }
    }

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
    let detected = null, detail = null;
    try { detail = await lookupAffiliationDetail(stripe, email); detected = detail.status; } catch (e) { out.warnings.push('affiliation_lookup: ' + String(e.message || e).slice(0, 120)); }
    const rosterCurrent = !!(detail && detail.status === 'current' && detail.source === 'roster');
    if (rosterCurrent) affiliation = 'current';
    if (detected === 'returning' && affiliation !== 'returning') { out.warnings.push('affiliation set to returning from billing history'); affiliation = 'returning'; }
    out.affiliation = affiliation;
    const feeExempt = !!(rosterCurrent && detail.feeExempt);
    if (feeExempt) out.warnings.push('Agent is marked fee exempt in the Hub: no subscriptions created');
    const alreadyBilled = feeExempt || (!rosterCurrent && (detected === 'current' || detected === 'review'));
    if (alreadyBilled) {
      out.warnings.push('Agent already has a live plan subscription in Stripe: no new subscriptions created; broker to review');
      out.affiliation = 'current';
    }

    // 3) Monthly plan subscription on the Associate's own day (decisions 102 and 103)
    if (customer && pmId && planInfo && !alreadyBilled) {
      try {
        const firstTs = rosterCurrent ? nextMonthDayTs(detail.startDate, detail.paidThrough) : monthlyStartTs(startDate);
        if (rosterCurrent && !firstTs) out.warnings.push('Monthly fee not scheduled: roster join date MISSING DATA');
        if (!(rosterCurrent && !firstTs)) {
          const params = {
            customer: customer.id,
            items: [{ price: planInfo.price }],
            proration_behavior: 'none',
            default_payment_method: pmId,
            metadata: { kind: 'agent_membership_monthly', email: email, full_name: fullName, plan: planInfo.portal, start_date: startDate || '', affiliation: affiliation }
          };
          if (firstTs) params.trial_end = firstTs;
          const monthly = await stripe.subscriptions.create(params, { idempotencyKey: 'aari-monthly:' + email });
          out.subscriptions.monthly = monthly.id;
          out.monthly_first_charge = firstTs ? new Date(firstTs * 1000).toISOString().slice(0, 10) : 'today';
        }
      } catch (e) { out.warnings.push('monthly_sub: ' + String(e.message || e).slice(0, 140)); }

      // 4) Annual E&O subscription: renews on the Start Date each year (current Associates: original join date)
      const eoTrial = rosterCurrent ? nextAnniversaryTs(detail.startDate) : eoRenewalTs(startDate);
      if (!eoTrial) out.warnings.push('E&O renewal not scheduled: roster start date MISSING DATA');
      if (eoTrial) try {
        const eo = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: EO_PRICE }],
          trial_end: eoTrial,
          proration_behavior: 'none',
          default_payment_method: pmId,
          metadata: { kind: 'agent_eo_annual', email: email, full_name: fullName }
        }, { idempotencyKey: 'aari-eo:' + email });
        out.subscriptions.eo = eo.id;
      } catch (e) { out.warnings.push('eo_sub: ' + String(e.message || e).slice(0, 140)); }
    } else {
      out.warnings.push('missing customer, payment method, or plan; subscriptions skipped');
    }

    // 4a) Decision 109: Stripe now bills this current agent's monthly fee. Tell the Broker to turn off the old
    // SkySlope Books recurring before its next charge, so the agent is never charged twice for the same month.
    if (rosterCurrent && out.subscriptions.monthly) {
      try {
        const sendViaProxy = require('./_send-via-proxy');
        const skyTs = nextMonthDayTs(detail.startDate);
        const skyDate = skyTs ? new Date(skyTs * 1000).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }) : 'their next billing day';
        const esc = function (x) { return String(x || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
        await sendViaProxy({
          lane: 'internal',
          to: 'marlenyi@aarirealty.com',
          subject: 'Turn off SkySlope Books recurring: ' + (fullName || email) + ' (before ' + skyDate + ')',
          html: '<div style="font-family:Arial,sans-serif;font-size:14px;color:#141210;line-height:1.6;max-width:560px">'
            + '<p><b>' + esc(fullName || email) + '</b> just saved a card in the Hub. Stripe now bills their Monthly Brokerage Fee'
            + (out.monthly_first_charge ? ', first charge ' + esc(out.monthly_first_charge) : '') + '.</p>'
            + '<p><b>Do this:</b> turn off their recurring monthly charge in SkySlope Books before <b>' + esc(skyDate) + '</b>. Deal fees stay in SkySlope.</p>'
            + '<p style="color:#6b6b6b;font-size:12px">Register decisions 98a and 109. Sent once, when the card was saved.</p></div>',
          emailType: 'skyslope_recurring_off'
        });
        out.skyslope_alert = 'sent';
      } catch (e) { out.warnings.push('skyslope_alert: ' + String(e.message || e).slice(0, 120)); }
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

    // 5) Hub account: created by the Broker once the license transfer shows in DBPR (the automatic provision function is disabled).

    return res.status(200).json(out);
  } catch (err) {
    console.error('finalize-join error:', err);
    return res.status(500).json({ error: 'finalize failed' });
  }
};
