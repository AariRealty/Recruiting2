// Affiliation status from Stripe billing history (decision #75).
// current:   the email has a live monthly plan subscription (active, trialing or past_due)
// returning: the email had a monthly plan subscription that has ended
// new:       no monthly plan subscription on record
const PLAN_PRICE_IDS = [
  'price_1TrolCHTQU4zpF23sVKjtlYr', // Aari Mentorship 75/25
  'price_1TrolKHTQU4zpF231UVO8zmQ', // Aari Growth 85/15
  'price_1TrolMHTQU4zpF23lzz3Zpwi'  // Aari Max 100%
];
const LIVE = ['active', 'trialing', 'past_due'];

function isPlanSub(sub) {
  const meta = (sub.metadata || {}).kind === 'agent_membership_monthly';
  const items = ((sub.items || {}).data || []);
  return meta || items.some(function (it) { return it.price && PLAN_PRICE_IDS.indexOf(it.price.id) !== -1; });
}

async function lookupAffiliation(stripe, email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean) return 'new';
  const customers = await stripe.customers.list({ email: clean, limit: 10 });
  let hadPlan = false;
  for (const c of (customers.data || [])) {
    const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 50 });
    for (const s of (subs.data || [])) {
      if (!isPlanSub(s)) continue;
      if (LIVE.indexOf(s.status) !== -1) return 'current';
      hadPlan = true;
    }
  }
  return hadPlan ? 'returning' : 'new';
}

module.exports = { lookupAffiliation };
