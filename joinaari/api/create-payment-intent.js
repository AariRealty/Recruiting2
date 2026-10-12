const Stripe = require('stripe');
const { computePrice, PROMO_RULES, checkPromoEligibility } = require('./_pricing');
const { lookupAffiliationDetail } = require('./_affiliation');

module.exports = async function handler(req, res) {
  const __allowedOrigins = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', __allowedOrigins.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { first_name, last_name, email, phone, amount, plan_name, addons, coupon_code, license_number, affiliation_status } = req.body || {};

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured. Add it in Vercel Environment Variables.' });
    }

    // Validate the key format
    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      return res.status(500).json({ error: 'Payment configuration error. Please contact support.' });
    }

    // C1: price is computed server-side from the plan/add-on/coupon SELECTION.
    // The client-sent `amount` is advisory only and is never charged.
    const pricing = computePrice({ plan_name: plan_name, addons: addons, coupon_code: coupon_code });
    if (!pricing.ok) {
      return res.status(400).json({ error: 'Invalid plan selection', detail: pricing.error });
    }

    // Decision #91: an agent active on the Hub roster (or billed in Stripe) is current. Nothing is charged today;
    // the card is saved for the monthly plan fee from the 1st of next month (Manual 68.1, no waived month).
    var affDetail = null;
    try { affDetail = await lookupAffiliationDetail(Stripe(process.env.STRIPE_SECRET_KEY), email); } catch (e) { console.warn('[create-payment-intent] affiliation lookup failed:', e && e.message); }
    var isCurrent = !!(affDetail && affDetail.status === 'current');

    if (!isCurrent && pricing.couponApplied && PROMO_RULES[pricing.couponApplied]) {
      var elig = await checkPromoEligibility(pricing.couponApplied, email, license_number);
      if (!elig.ok) return res.status(elig.status).json({ error: elig.error, message: elig.message });
      // Exhibit A 41.3: the offer is for Associates new to Aari Realty. Billing history decides (decision #75).
      if (String(affiliation_status || '').toLowerCase() === 'returning') return res.status(403).json({ error: 'promo_not_eligible', message: 'This offer is for agents new to Aari Realty. Remove the code to continue.' });
      if (affDetail && affDetail.status !== 'new') return res.status(403).json({ error: 'promo_not_eligible', message: 'This offer is for agents new to Aari Realty. Remove the code to continue.' });
    }

    // Loud (non-fatal) signal if the browser's number disagrees with ours.
    if (amount !== undefined && Math.abs(parseFloat(amount) - pricing.totalDueToday) > pricing.tolerance) {
      console.warn('[create-payment-intent] client/server amount mismatch — client:', amount, 'server:', pricing.totalDueToday, 'plan:', plan_name);
    }

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // Stripe minimum is $0.50. A true $0 total (full-waive coupon) is handled
    // by the client skipping confirmation; we still create a min PI so the
    // Elements form can mount, but it is never confirmed when total is 0.
    const amountCents = Math.max(50, Math.round(pricing.totalDueToday * 100));

    // Create or find Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0] || await stripe.customers.create({
      name: first_name + ' ' + last_name,
      email: email,
      metadata: { phone: phone || '' }
    });

    const intentMeta = {
      kind: 'agent_membership',
      plan: plan_name || '',
      agent_name: first_name + ' ' + last_name,
      agent_email: email,
      license: license_number || '',
      phone: phone || '',
      coupon: pricing.couponApplied || '',
      server_total: String(pricing.totalDueToday),
      discount: String(pricing.discount || 0)
    };

    // Nothing due today (promo covers the full amount): save the card for
    // recurring fees with a SetupIntent instead of charging.
    if (isCurrent) { intentMeta.affiliation = 'current'; intentMeta.server_total = '0'; intentMeta.coupon = ''; }
    if (isCurrent || pricing.totalDueToday <= 0) {
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        usage: 'off_session',
        payment_method_types: ['card'], // ICA and Manual 68.1: card on file only
        description: 'Aari Realty Onboarding: ' + (plan_name || 'Commission Plan'),
        metadata: intentMeta
      });
      return res.status(200).json({
        mode: 'setup',
        client_secret: setupIntent.client_secret,
        customer_id: customer.id,
        amount: 0,
        current: isCurrent,
        discount: isCurrent ? 0 : pricing.discount,
        monthly: pricing.monthlyAmount
      });
    }

    // Create PaymentIntent with card explicitly enabled
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: customer.id,
      setup_future_usage: 'off_session',
      payment_method_types: ['card'], // ICA and Manual 68.1: card on file only
      description: 'Aari Realty Onboarding: ' + (plan_name || 'Commission Plan'),
      metadata: {
        kind: 'agent_membership',
        plan: plan_name || '',
        agent_name: first_name + ' ' + last_name,
        agent_email: email,
        license: license_number || '',
        phone: phone || '',
        coupon: pricing.couponApplied || '',
        server_total: String(pricing.totalDueToday)
      }
    });

    // The promo spot is recorded only after payment succeeds (finalize-join.js).

    return res.status(200).json({
      mode: 'payment',
      client_secret: paymentIntent.client_secret,
      discount: pricing.discount,
      customer_id: customer.id,
      amount: pricing.totalDueToday,
      monthly: pricing.monthlyAmount
    });
  } catch (err) {
    console.error('[create-payment-intent] Error:', err.type, err.message);
    const detail = err.type === 'StripeAuthenticationError'
      ? 'Payment configuration error. Please contact support.'
      : err.message;
    return res.status(500).json({ error: 'Failed to create payment intent', detail: detail });
  }
};
