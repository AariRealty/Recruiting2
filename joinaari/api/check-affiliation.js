const Stripe = require('stripe');
const { lookupAffiliation } = require('./_affiliation');

// Returns only new, returning or current for an email. No billing details leave the server.
module.exports = async function handler(req, res) {
  const allowed = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', allowed.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const email = String((req.body || {}).email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'valid email required' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'not configured' });
  try {
    const status = await lookupAffiliation(Stripe(process.env.STRIPE_SECRET_KEY), email);
    return res.status(200).json({ status: status });
  } catch (e) {
    return res.status(502).json({ error: 'lookup_failed' });
  }
};
