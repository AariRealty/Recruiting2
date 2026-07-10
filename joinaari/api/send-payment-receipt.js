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
    const firstName = String(name).split(' ')[0];
    const total = Number(amount);
    const EO = 199;
    const membershipToday = Math.max(0, total - EO);
    const fmt = function (n) { return '$' + Number(n).toFixed(2); };
    const amountFormatted = fmt(total);
    const planName = plan || 'Aari Max 100%';

    var breakdownRows;
    if (total > EO) {
      breakdownRows =
        '<tr><td style="padding:11px 0;border-bottom:1px solid #eceae4;font-size:13px;color:#9a9a92;">Membership, ' + planName + '</td><td align="right" style="padding:11px 0;border-bottom:1px solid #eceae4;font-size:13px;color:#111111;">' + fmt(membershipToday) + '</td></tr>' +
        '<tr><td style="padding:11px 0;border-bottom:1px solid #eceae4;font-size:13px;color:#9a9a92;">Annual E&amp;O + Compliance</td><td align="right" style="padding:11px 0;border-bottom:1px solid #eceae4;font-size:13px;color:#111111;">$199.00</td></tr>';
    } else {
      breakdownRows =
        '<tr><td style="padding:11px 0;border-bottom:1px solid #eceae4;font-size:13px;color:#9a9a92;">Plan</td><td align="right" style="padding:11px 0;border-bottom:1px solid #eceae4;font-size:13px;color:#111111;">' + planName + '</td></tr>';
    }

    const monthlyLine = monthly_amount ? ('Then $' + Number(monthly_amount).toFixed(2) + '/mo, billed monthly. ') : '';
    const metaLine = 'Receipt ' + (payment_id ? (payment_id + ' , ') : '') + date + ' , ' + name;

    const html =
'<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'<style>@import url(https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap);</style>' +
'</head><body style="margin:0;padding:0;background:#f3f3f2;font-family:Montserrat,Arial,sans-serif;">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f2;padding:28px 12px;"><tr><td align="center">' +
'<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border:1px solid #e6e4de;border-radius:12px;">' +
'<tr><td style="padding:30px 30px 20px;border-bottom:1px solid #eceae4;">' +
'<div style="font-family:&quot;Cormorant Garamond&quot;,Georgia,serif;font-weight:600;font-size:25px;color:#111111;line-height:1;">Aari Realty</div>' +
'<div style="font-size:8px;letter-spacing:2.5px;color:#9a9a92;text-transform:uppercase;margin-top:4px;">Southwest Florida Brokerage</div>' +
'</td></tr>' +
'<tr><td style="padding:24px 30px 4px;">' +
'<div style="font-size:10px;letter-spacing:2.5px;color:#9a9a92;text-transform:uppercase;font-weight:600;">Payment received</div>' +
'<div style="font-family:&quot;Cormorant Garamond&quot;,Georgia,serif;font-weight:500;font-size:38px;color:#111111;line-height:1.05;margin:10px 0 14px;">You are in, <em>' + firstName + '</em>.</div>' +
'</td></tr>' +
'<tr><td style="padding:0 30px 8px;">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
breakdownRows +
'<tr><td style="padding:14px 0 0;font-size:14px;color:#111111;font-weight:600;">Total paid today</td>' +
'<td align="right" style="padding:14px 0 0;font-family:&quot;Cormorant Garamond&quot;,Georgia,serif;font-size:22px;color:#111111;">' + amountFormatted + ' &nbsp;<span style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2d6a4f;background:#e7f0ea;padding:3px 9px;border-radius:20px;">Paid</span></td></tr>' +
'</table></td></tr>' +
'<tr><td style="padding:16px 30px 6px;">' +
'<div style="font-size:12px;color:#9a9a92;line-height:1.7;">' + monthlyLine + 'A separate email has your Agent Hub login to get started.</div>' +
'</td></tr>' +
'<tr><td style="padding:14px 30px 4px;">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e0d8;border-radius:10px;background:#fafafa;"><tr>' +
'<td style="padding:16px;width:46px;vertical-align:middle;"><div style="width:30px;height:38px;background:#B04040;border-radius:4px;color:#ffffff;font-size:9px;font-weight:700;text-align:center;line-height:38px;">PDF</div></td>' +
'<td style="padding:16px 16px 16px 0;vertical-align:middle;"><div style="font-size:13px;font-weight:600;color:#111111;">Your signed Independent Contractor Agreement</div><div style="font-size:11px;color:#9a9a92;">Attached to this email</div></td>' +
'</tr></table></td></tr>' +
'<tr><td style="padding:14px 30px 4px;">' +
'<div style="font-size:11px;color:#b7b4ab;line-height:1.6;">' + metaLine + '</div>' +
'</td></tr>' +
'<tr><td style="padding:20px 30px 28px;">' +
'<div style="border-top:1px solid #eceae4;padding-top:16px;font-size:10px;color:#b7b4ab;line-height:1.8;">Aari Realty LLC , 9160 Forum Corporate Pkwy Suite 350, Fort Myers, FL 33905<br>239.688.1770 , join@aarirealty.com</div>' +
'</td></tr>' +
'</table></td></tr></table></body></html>';

    await resend.emails.send({
      from: 'Aari Realty <onboarding@aaritransactions.com>',
      to: email,
      cc: 'join@aarirealty.com',
      subject: 'Payment received at Aari Realty (' + amountFormatted + ')',
      html: html,
      attachments: [{ filename: 'Aari-Realty-ICA.pdf', path: 'https://joinaari.com/Aari-Realty-ICA.pdf' }]
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send payment receipt error:', err);
    return res.status(500).json({ error: 'Failed to send receipt' });
  }
};
