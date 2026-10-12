// Affiliation status from Stripe billing history (decisions #75 and rescan 4).
// current:   the email has a live subscription on a current plan price (active, trialing or past_due)
// review:    a live monthly subscription on a price not mapped to a plan (older price, or another Aari product); broker confirms
// returning: the email had a monthly membership subscription that has ended
// new:       no monthly membership subscription on record
// Any monthly recurring subscription counts, not only today's price IDs, so agents billed on older prices are found.
const PLAN_NAMES = {
  'price_1TrolCHTQU4zpF23sVKjtlYr': 'Aari Mentorship 75/25',
  'price_1TrolKHTQU4zpF231UVO8zmQ': 'Aari Growth 85/15',
  'price_1TrolMHTQU4zpF23lzz3Zpwi': 'Aari Max 100%'
};
const EO_PRICE = 'price_1TrolNHTQU4zpF236LAkKbqi';
const LIVE = ['active', 'trialing', 'past_due'];

function planItem(sub) {
  const items = ((sub.items || {}).data || []);
  for (const it of items) {
    const p = it.price || {};
    if (p.id === EO_PRICE) continue;
    if (PLAN_NAMES[p.id] || (p.recurring && p.recurring.interval === 'month')) return p;
  }
  return (sub.metadata || {}).kind === 'agent_membership_monthly' ? {} : null;
}

// The Hub roster (realty_members) is the source of truth for who is with Aari today (decision #91).
async function rosterStatus(email) {
  try {
    const { SUPABASE_ANON_PUBLIC } = require('./_pricing');
    const r = await fetch('https://fnlrgmuvtgwzjsihqxcn.supabase.co/rest/v1/rpc/aari_member_status', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_PUBLIC, 'Authorization': 'Bearer ' + SUPABASE_ANON_PUBLIC, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_email: email })
    });
    const rows = await r.json();
    return (Array.isArray(rows) && rows[0]) ? rows[0] : null;
  } catch (e) { return null; }
}

async function lookupAffiliationDetail(stripe, email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean) return { status: 'new', plan: '' };
  const roster = await rosterStatus(clean);
  let stripeDetail = await lookupStripe(stripe, clean);
  if (roster && roster.status === 'active') {
    // On the roster: current. If Stripe already bills a plan, nothing new is created (source stripe).
    return { status: 'current', plan: stripeDetail.plan || '', source: stripeDetail.status === 'current' || stripeDetail.status === 'review' ? 'stripe' : 'roster', startDate: roster.start_date || '', feeExempt: !!roster.fee_exempt };
  }
  if (roster && stripeDetail.status === 'new') stripeDetail = { status: 'returning', plan: '' }; // on the roster before, not active now
  return stripeDetail;
}

async function lookupStripe(stripe, clean) {
  const customers = await stripe.customers.list({ email: clean, limit: 10 });
  let hadPlan = false;
  for (const c of (customers.data || [])) {
    const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 50 });
    for (const s of (subs.data || [])) {
      const p = planItem(s);
      if (!p) continue;
      if (LIVE.indexOf(s.status) !== -1) {
        const known = !!PLAN_NAMES[p.id] || (s.metadata || {}).kind === 'agent_membership_monthly';
        return { status: known ? 'current' : 'review', plan: PLAN_NAMES[p.id] || '' };
      }
      hadPlan = true;
    }
  }
  return { status: hadPlan ? 'returning' : 'new', plan: '' };
}

async function lookupAffiliation(stripe, email) {
  return (await lookupAffiliationDetail(stripe, email)).status;
}

module.exports = { lookupAffiliation, lookupAffiliationDetail };
