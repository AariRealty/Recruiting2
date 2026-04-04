const payload = require('payload-api');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { first_name, last_name, email, phone } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }

    if (!process.env.PAYLOAD_SECRET_KEY) {
      return res.status(500).json({ error: 'PAYLOAD_SECRET_KEY not configured' });
    }

    const pl = payload.Session(process.env.PAYLOAD_SECRET_KEY);

    // Create customer in Payload
    const customer = await pl.create(pl.Customer({
      name: first_name + ' ' + last_name,
      email: email,
      phone_number: phone || undefined
    }));

    return res.status(200).json({
      customer_id: customer.id
    });
  } catch (err) {
    console.error('[create-customer] Error:', err.message, err.stack);
    return res.status(500).json({ error: 'Failed to create customer', detail: err.message });
  }
};
