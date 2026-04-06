const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { client_secret, amount, customer_id, first_name, last_name, email } = req.body;

    if (!client_secret || amount === undefined) {
      return res.status(400).json({ error: 'client_secret and amount are required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    }

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // Extract PaymentIntent ID from client secret (format: pi_xxx_secret_yyy)
    const piId = client_secret.split('_secret_')[0];
    const amountCents = Math.round(parseFloat(amount) * 100);

    // Update the PaymentIntent amount
    await stripe.paymentIntents.update(piId, {
      amount: amountCents
    });

    // Update customer info if provided
    if (customer_id && (first_name || email)) {
      const updates = {};
      if (first_name) updates.name = first_name + (last_name ? ' ' + last_name : '');
      if (email) updates.email = email;
      await stripe.customers.update(customer_id, updates);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[update-payment-intent] Error:', err.message);
    return res.status(500).json({ error: 'Failed to update payment intent', detail: err.message });
  }
};
