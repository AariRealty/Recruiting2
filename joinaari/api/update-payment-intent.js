const Stripe = require('stripe');
const { computePrice } = require('./_pricing');

module.exports = async function handler(req, res) {
  const __allowedOrigins = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', __allowedOrigins.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { client_secret, amount, customer_id, first_name, last_name, email, plan_name, addons, coupon_code, payment_intent_id } = req.body;

    if (!client_secret) {
      return res.status(400).json({ error: 'client_secret is required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    }

    // C1: recompute the authoritative amount server-side from the selection.
    const pricing = computePrice({ plan_name: plan_name, addons: addons, coupon_code: coupon_code });
    if (!pricing.ok) {
      return res.status(400).json({ error: 'Invalid plan selection', detail: pricing.error });
    }
    if (amount !== undefined && Math.abs(parseFloat(amount) - pricing.totalDueToday) > pricing.tolerance) {
      console.warn('[update-payment-intent] client/server amount mismatch — client:', amount, 'server:', pricing.totalDueToday, 'plan:', plan_name);
    }

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // Extract PaymentIntent ID from client secret (format: pi_xxx_secret_yyy)
    const piId = payment_intent_id || client_secret.split('_secret_')[0];
    const amountCents = Math.max(50, Math.round(pricing.totalDueToday * 100));

    // Update the PaymentIntent amount to the server-computed value
    await stripe.paymentIntents.update(piId, {
      amount: amountCents,
      metadata: { server_total: String(pricing.totalDueToday), coupon: pricing.couponApplied || '' }
    });

    // Update customer info if provided
    if (customer_id && (first_name || email)) {
      const updates = {};
      if (first_name) updates.name = first_name + (last_name ? ' ' + last_name : '');
      if (email) updates.email = email;
      await stripe.customers.update(customer_id, updates);
    }

    return res.status(200).json({ success: true, amount: pricing.totalDueToday, monthly: pricing.monthlyAmount });
  } catch (err) {
    console.error('[update-payment-intent] Error:', err.message);
    return res.status(500).json({ error: 'Failed to update payment intent', detail: err.message });
  }
};
