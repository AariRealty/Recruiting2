// ============================================================================
// Aari Realty — server-authoritative pricing (audit fix C1)
// Single source of truth for onboarding amounts. Client-supplied dollar
// figures are NEVER trusted; the browser may choose WHICH plan / add-ons /
// coupon, but the price is always computed here from these tables.
//
// Keep PLAN_PRICES / ADDON_PRICES / ANNUAL_FEE in sync with the displayed
// prices in index.html. If they drift, legit checkouts will be rejected.
// ============================================================================

const PLAN_PRICES = {
  'Aari Mentorship 75/25': 59,
  'Aari Growth 85/15': 79,
  'Aari Max 100%': 99,
};

const ADDON_PRICES = {
  'CRM System': 49,
  'Brand Builder': 79,
};

const ANNUAL_FEE = 199; // E&O + compliance, due today, also billed annually

// Supabase anon key: public by design (same key any browser client uses).
// Used only when the Vercel env var is not set.
const SUPABASE_ANON_PUBLIC = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubHJnbXV2dGd3empzaWhxeGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODUxNDMsImV4cCI6MjA5Mzk2MTE0M30.C2-9M_OBuDLDDzr6g3DqisZ9OPDoFoKY7uQb7EsgG_Y';

const PROMO_RULES = {
  SWITCH199: { maxRedemptions: 25, expiresAt: '2027-03-31T23:59:59-04:00' },
};

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Resolve a coupon code to {type, value}. Mirrors validate-coupon.js:
// built-in VIP plus any codes in the COUPON_CODES env var.
// Returns null for empty/unknown codes. (Test backdoors removed in go-live.)
function resolveCoupon(code) {
  if (!code) return null;
  const coupons = { VIP: { type: 'percent_off', value: 50 }, SWITCH199: { type: 'flat_off', value: 199 } };
  const raw = process.env.COUPON_CODES || '';
  raw.split(',').forEach(function (entry) {
    const parts = entry.trim().split(':');
    if (parts.length >= 2) {
      coupons[parts[0].trim().toUpperCase()] = {
        type: parts[1].trim(),
        value: parts[2] ? parseFloat(parts[2].trim()) : 0,
      };
    }
  });
  var key = String(code).trim().toUpperCase();
  var coupon = coupons[key] || null;
  if (!coupon) return null;

  var rule = PROMO_RULES[key];
  if (rule && new Date() >= new Date(rule.expiresAt)) return null;

  return coupon;
}

// Compute the authoritative amounts from a plan selection.
//   opts.plan_name   : string (must exist in PLAN_PRICES)
//   opts.addons      : array of add-on names (strings) or [{name}]
//   opts.coupon_code : string | null
// Returns { ok:true, totalDueToday, monthlyAmount, ... } or { ok:false, error }.
function computePrice(opts) {
  opts = opts || {};

  const planName = opts.plan_name;
  if (!planName || !(planName in PLAN_PRICES)) {
    return { ok: false, error: 'unknown_plan', plan_name: planName || null };
  }
  const planMonthly = PLAN_PRICES[planName];

  let addonMonthly = 0;
  const addonInput = Array.isArray(opts.addons) ? opts.addons : [];
  const isMentorship = planName.indexOf('Mentorship') !== -1;
  for (let i = 0; i < addonInput.length; i++) {
    const a = addonInput[i];
    const name = a && a.name ? a.name : a;
    if (!(name in ADDON_PRICES)) {
      return { ok: false, error: 'unknown_addon', addon: name || null };
    }
    // Brand Builder is complimentary for the first 6 months on Mentorship.
    if (isMentorship && name === 'Brand Builder') continue;
    addonMonthly += ADDON_PRICES[name];
  }

  const fullMonthly = planMonthly + addonMonthly;

  // Flat annual fee due at signup. No proration: the recurring monthly
  // subscription already starts clean on the 1st of next month (see
  // setup-recurring.js billing_cycle_anchor), so the join month itself
  // is never billed.
  const subtotal = ANNUAL_FEE;

  // Coupon resolved + applied server-side; client type/value is ignored.
  let discount = 0;
  const coupon = resolveCoupon(opts.coupon_code);
  if (coupon) {
    switch (coupon.type) {
      case 'waive_all':
        discount = subtotal;
        break;
      case 'waive_annual':
        discount = ANNUAL_FEE;
        break;
      case 'percent_off':
        discount = round2((subtotal * coupon.value) / 100);
        break;
      case 'flat_off':
        discount = Math.min(coupon.value, subtotal);
        break;
      // 'waive_monthly' and 'set_total' deliberately unsupported: there is
      // no prorated monthly left to waive, and set_total was a test backdoor.
      default:
        discount = 0;
    }
  }

  const totalDueToday = round2(Math.max(0, subtotal - discount));

  return {
    ok: true,
    totalDueToday: totalDueToday,
    monthlyAmount: fullMonthly,
    subtotal: subtotal,
    discount: discount,
    annualFee: ANNUAL_FEE,
    couponApplied: coupon ? String(opts.coupon_code).trim().toUpperCase() : null,
    // Slack for accepting a client-claimed amount: rounding only, no proration variance.
    tolerance: 0.02,
  };
}

// Promo eligibility (Exhibit A 41.3): limited redemptions, offer end date,
// new Aari Realty Associates only, once per person. A spot counts only when
// payment (or card setup on a $0 total) succeeds; see finalize-join.js.
// Returns { ok:true } or { ok:false, status, error, message }.
async function checkPromoEligibility(code, email, license) {
  var key = String(code || '').trim().toUpperCase();
  var rule = PROMO_RULES[key];
  if (!rule) return { ok: true };
  if (new Date() >= new Date(rule.expiresAt)) {
    return { ok: false, status: 410, error: 'coupon_expired', message: 'This offer ended on March 31, 2027.' };
  }
  if (!String(email || '').trim()) return { ok: false, status: 400, error: 'email_required', message: 'Enter your email before applying a code.' };
  var anon = SUPABASE_ANON_PUBLIC;
  if (!anon) return { ok: false, status: 500, error: 'promo_unavailable', detail: 'no_anon_key', message: 'Promo validation unavailable. Contact support.' };
  try {
    var r = await fetch('https://fnlrgmuvtgwzjsihqxcn.supabase.co/rest/v1/rpc/promo_check', {
      method: 'POST',
      headers: { 'apikey': anon, 'Authorization': 'Bearer ' + anon, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_code: key, p_email: email, p_license: license || '', p_max: rule.maxRedemptions })
    });
    if (!r.ok) throw new Error('rpc ' + r.status);
    var out = await r.json();
    if (out.ok) return { ok: true };
    if (out.reason === 'exhausted') return { ok: false, status: 410, error: 'coupon_exhausted', message: 'All ' + rule.maxRedemptions + ' spots have been taken.' };
    if (out.reason === 'email_required') return { ok: false, status: 400, error: 'email_required', message: 'Enter your email before applying a code.' };
    return { ok: false, status: 409, error: 'not_eligible', message: 'This offer is for agents new to Aari Realty only.' };
  } catch (err) {
    return { ok: false, status: 500, error: 'promo_unavailable', detail: String(err.message || err).slice(0, 80), message: 'Promo validation unavailable. Contact support.' };
  }
}

module.exports = { SUPABASE_ANON_PUBLIC, PLAN_PRICES, ADDON_PRICES, ANNUAL_FEE, PROMO_RULES, computePrice, resolveCoupon, checkPromoEligibility };
