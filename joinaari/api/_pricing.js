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

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Resolve a coupon code to {type, value}. Mirrors validate-coupon.js:
// built-in VIP plus any codes in the COUPON_CODES env var.
// Returns null for empty/unknown codes. (Test backdoors removed in go-live.)
function resolveCoupon(code) {
  if (!code) return null;
  const coupons = { VIP: { type: 'percent_off', value: 50 } };
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
  return coupons[String(code).trim().toUpperCase()] || null;
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

  // Proration for the current month (server clock), mirroring the client.
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate() + 1;
  const proratedTotal = round2((fullMonthly * daysRemaining) / daysInMonth);

  const subtotal = round2(ANNUAL_FEE + proratedTotal);

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
      case 'waive_monthly':
        discount = proratedTotal;
        break;
      case 'percent_off':
        discount = round2((subtotal * coupon.value) / 100);
        break;
      case 'flat_off':
        discount = Math.min(coupon.value, subtotal);
        break;
      // 'set_total' deliberately unsupported (was a test backdoor)
      default:
        discount = 0;
    }
  }

  const totalDueToday = round2(Math.max(0, subtotal - discount));

  return {
    ok: true,
    totalDueToday: totalDueToday,
    monthlyAmount: fullMonthly,
    proratedTotal: proratedTotal,
    subtotal: subtotal,
    discount: discount,
    annualFee: ANNUAL_FEE,
    daysRemaining: daysRemaining,
    daysInMonth: daysInMonth,
    couponApplied: coupon ? String(opts.coupon_code).trim().toUpperCase() : null,
    // Slack for accepting a client-claimed amount: one day's proration + rounding.
    tolerance: round2(fullMonthly / daysInMonth) + 0.02,
  };
}

module.exports = { PLAN_PRICES, ADDON_PRICES, ANNUAL_FEE, computePrice, resolveCoupon };
