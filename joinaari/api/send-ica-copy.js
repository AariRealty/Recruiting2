const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  const __allowedOrigins = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', __allowedOrigins.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, license, phone, plan, signature, date, mls, years_licensed, closings_last_12_months, region, realtor_association } = req.body;

    if (!email || !name || !signature) {
      return res.status(400).json({ error: 'email, name, and signature are required' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const formattedDate = date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
    .body h2 { font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #0a0a0a; margin: 0 0 24px 0; border-bottom: 2px solid #0a0a0a; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .row .label { color: #888; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
    .row .value { color: #1a1a1a; text-align: right; }
    .sig-block { margin-top: 32px; padding: 24px; border: 1px solid #ddd; border-radius: 8px; }
    .sig-block h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 0 0 12px 0; }
    .signature { font-family: 'Georgia', serif; font-size: 24px; font-style: italic; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 16px; }
    .sig-detail { font-size: 12px; color: #666; margin: 4px 0; }
    .notice { background: #f9f9f9; border-left: 3px solid #0a0a0a; padding: 16px; margin-top: 32px; font-size: 12px; color: #666; line-height: 1.6; }
    .footer { background: #0a0a0a; color: rgba(255,255,255,0.5); padding: 24px 32px; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AARI.</h1>
      <p>INDEPENDENT CONTRACTOR AGREEMENT</p>
    </div>
    <div class="body">
      <h2>Executed Agreement Summary</h2>

      <div class="row"><span class="label">Agent Name</span><span class="value">${name}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${email}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${phone || 'N/A'}</span></div>
      <div class="row"><span class="label">License No.</span><span class="value">${license || 'N/A'}</span></div>
      <div class="row"><span class="label">MLS</span><span class="value">${mls || 'N/A'}</span></div>
      <div class="row"><span class="label">Years Licensed</span><span class="value">${years_licensed || 'N/A'}</span></div>
      <div class="row"><span class="label">Closings (Last 12 Mo.)</span><span class="value">${closings_last_12_months || 'N/A'}</span></div>
      ${region && region !== 'N/A' ? `<div class="row"><span class="label">Region</span><span class="value">${region}</span></div>` : ''}
      ${realtor_association && realtor_association !== 'N/A' ? `<div class="row"><span class="label">Realtor Association</span><span class="value">${realtor_association}</span></div>` : ''}
      <div class="row"><span class="label">Selected Plan</span><span class="value">${plan || 'N/A'}</span></div>
      <div class="row"><span class="label">Effective Date</span><span class="value">${formattedDate}</span></div>

      <div style="display: flex; gap: 16px; margin-top: 32px;">
        <div class="sig-block" style="flex: 1;">
          <h3>Associate</h3>
          <div class="signature">${signature}</div>
          <p class="sig-detail"><strong>Printed Name:</strong> ${name}</p>
          <p class="sig-detail"><strong>License No.:</strong> ${license || 'N/A'}</p>
          <p class="sig-detail"><strong>Title:</strong> Sales Associate</p>
          <p class="sig-detail"><strong>Date:</strong> ${formattedDate}</p>
        </div>
        <div class="sig-block" style="flex: 1;">
          <h3>Qualifying Broker</h3>
          <div class="signature">Marlenyi Paredes</div>
          <p class="sig-detail"><strong>Printed Name:</strong> Marlenyi Paredes</p>
          <p class="sig-detail"><strong>License No.:</strong> BK3527289</p>
          <p class="sig-detail"><strong>Title:</strong> Qualifying Broker</p>
          <p class="sig-detail"><strong>Date:</strong> ${formattedDate}</p>
        </div>
      </div>

      <div class="notice">
        <strong>Important:</strong> This email confirms the electronic execution of your Independent Contractor Agreement with Aari Realty LLC. The full agreement, including all addendums and the Operations &amp; Compliance Manual, is binding as of ${formattedDate}. Electronic signatures carry the same legal weight as original signatures under Florida's Uniform Electronic Transactions Act (Chapter 668, Florida Statutes). Please retain this email for your records.
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
      subject: `Your Executed ICA — Aari Realty LLC (${formattedDate})`,
      html: html
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send ICA copy error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
