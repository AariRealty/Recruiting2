const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  const __allowedOrigins = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', __allowedOrigins.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, plan, amount, payment_id, addons, monthly_amount } = req.body;

    if (!email || !name || !amount) {
      return res.status(400).json({ error: 'email, name, and amount are required' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const amountFormatted = '$' + Number(amount).toFixed(2);
    const monthlyFormatted = monthly_amount ? '$' + Number(monthly_amount).toFixed(2) + '/mo' : 'N/A';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; }
    .header { background: #0a0a0a; color: #ffffff; padding: 40px 32px; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 300; letter-spacing: 6px; margin: 0; }
    .header p { font-size: 12px; letter-spacing: 2px; opacity: 0.6; margin-top: 8px; }
    .body { padding: 40px 32px; }
    .greeting { font-size: 18px; font-weight: 300; color: #1a1a1a; margin-bottom: 8px; }
    .intro { font-size: 14px; color: #666; margin-bottom: 32px; line-height: 1.6; }
    .receipt-box { border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin-bottom: 32px; }
    .receipt-header { background: #f9f9f9; padding: 16px 24px; border-bottom: 1px solid #eee; }
    .receipt-header h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 0; }
    .receipt-body { padding: 0; }
    .row { display: flex; justify-content: space-between; padding: 14px 24px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .row .label { color: #888; }
    .row .value { color: #1a1a1a; font-weight: 600; text-align: right; }
    .total-row { background: #0a0a0a; color: #ffffff; display: flex; justify-content: space-between; padding: 18px 24px; font-size: 16px; }
    .total-row .label { opacity: 0.7; }
    .total-row .value { font-weight: 700; }
    .notice { background: #f0faf0; border-left: 3px solid #27ae60; padding: 16px; margin-top: 24px; font-size: 13px; color: #333; line-height: 1.6; border-radius: 0 6px 6px 0; }
    .footer { background: #0a0a0a; color: rgba(255,255,255,0.5); padding: 24px 32px; text-align: center; font-size: 11px; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AARI.</h1>
      <p>PAYMENT RECEIPT</p>
    </div>
    <div class="body">
      <p class="greeting">Welcome to Aari Realty, ${name.split(' ')[0]}.</p>
      <p class="intro">Your payment has been processed successfully. Below is your receipt for your records.</p>

      <div class="receipt-box">
        <div class="receipt-header">
          <h2>Transaction Details</h2>
        </div>
        <div class="receipt-body">
          <div class="row"><span class="label">Date</span><span class="value">${date}</span></div>
          <div class="row"><span class="label">Agent</span><span class="value">${name}</span></div>
          <div class="row"><span class="label">Plan</span><span class="value">${plan || 'N/A'}</span></div>
          ${addons && addons !== 'None' ? `<div class="row"><span class="label">Add-ons</span><span class="value">${addons}</span></div>` : ''}
          <div class="row"><span class="label">Payment ID</span><span class="value" style="font-size:11px;font-family:monospace;color:#888;">${payment_id || 'N/A'}</span></div>
        </div>
        <div class="total-row">
          <span class="label">Amount Charged</span>
          <span class="value">${amountFormatted}</span>
        </div>
      </div>

      <div class="row" style="border:1px solid #eee;border-radius:8px;margin-bottom:24px;">
        <span class="label">Recurring Monthly</span>
        <span class="value">${monthlyFormatted}</span>
      </div>

      <div class="notice">
        <strong>What happens next?</strong> Our team will reach out within 24 hours to complete your onboarding, set up your recurring billing, and get you plugged into all of your tools and systems.
      </div>
    </div>
    <div class="footer">
      Aari Realty LLC &middot; 9160 Forum Corporate Pkwy Suite 350, Fort Myers, FL 33905<br>
      (239) 688-1770 &middot; join@aarirealty.com
    </div>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: 'Aari Realty <noreply@aarirealty.com>',
      to: email,
      cc: 'join@aarirealty.com',
      subject: `Payment Receipt — Aari Realty (${amountFormatted})`,
      html: html
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send payment receipt error:', err);
    return res.status(500).json({ error: 'Failed to send receipt' });
  }
};
