const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { first_name, last_name, email, phone, amount, plan_name } = req.body;

    if (!first_name || !last_name || !email || !amount) {
      return res.status(400).json({ error: 'first_name, last_name, email, and amount are required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    }

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // Create or find Stripe customer
    const customer = await stripe.customers.create({
      name: first_name + ' ' + last_name,
      email: email,
      phone: phone || undefined
    });

    // Create PaymentIntent — setup_future_usage saves the card for recurring
    const amountCents = Math.round(parseFloat(amount) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: customer.id,
      setup_future_usage: 'off_session',
      automatic_payment_methods: { enabled: true },
      description: 'Aari Realty Onboarding — ' + (plan_name || 'Commission Plan'),
      metadata: {
        plan: plan_name || '',
        agent_name: first_name + ' ' + last_name,
        agent_email: email
      }
    });

    return res.status(200).json({
      client_secret: paymentIntent.client_secret,
      customer_id: customer.id
    });
  } catch (err) {
    console.error('[create-payment-intent] Error:', err.message);
    return res.status(500).json({ error: 'Failed to create payment intent', detail: err.message });
  }
};
