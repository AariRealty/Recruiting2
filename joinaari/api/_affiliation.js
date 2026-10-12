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

async function lookupAffiliationDetail(stripe, email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean) return { status: 'new', plan: '' };
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
