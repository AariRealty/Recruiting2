const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  const __allowedOrigins = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', __allowedOrigins.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      name, email, phone, license, plan, addons,
      amount, monthly_amount, payment_id, coupon_code,
      signature, ica_date, mls, years_licensed, closings,
      region, realtor_association, how_did_you_hear,
      monthly_subscription_id, annual_subscription_id, subscription_errors,
      consent_esign, consent_text, initials, initials_count, signed_at_client
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const amountFormatted = amount ? '$' + Number(amount).toFixed(2) : 'N/A';
    const monthlyFormatted = monthly_amount ? '$' + Number(monthly_amount).toFixed(2) + '/mo' : 'N/A';

    // Recurring billing setup status (surfaces silent subscription failures to the broker)
    const hasSubErrors = subscription_errors && subscription_errors !== '' && subscription_errors !== '{}';
    const subStatusBlock = `
      <div class="section-block">
        <h2 class="section-title">Recurring Billing Setup</h2>
        ${hasSubErrors ? `<div style="background:#fdecea;border-left:4px solid #c0392b;padding:14px 16px;border-radius:0 6px 6px 0;margin-bottom:12px;">
          <strong style="color:#c0392b;">&#9888; Subscription setup error — needs manual follow-up in Stripe.</strong>
          <div style="font-size:12px;color:#a33;margin-top:6px;font-family:monospace;word-break:break-word;">${subscription_errors}</div>
        </div>` : ''}
        <div class="row"><span class="label">Monthly Subscription</span><span class="value" style="font-size:11px;font-family:monospace;${monthly_subscription_id ? '' : 'color:#c0392b;'}">${monthly_subscription_id || 'NOT CREATED'}</span></div>
        <div class="row"><span class="label">Annual ($199) Subscription</span><span class="value" style="font-size:11px;font-family:monospace;${annual_subscription_id ? '' : 'color:#c0392b;'}">${annual_subscription_id || 'NOT CREATED'}</span></div>
      </div>`;

    // Electronic signature record — server-captured for audit defensibility.
    const signedAtServer = new Date().toISOString();
    const signerIp = ((req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || 'unknown';
    const signerUa = req.headers['user-agent'] || 'unknown';
    const esignBlock = `
      <div class="section-block">
        <h2 class="section-title">Electronic Signature Record</h2>
        <div class="row"><span class="label">E-Sign Consent</span><span class="value" style="${consent_esign ? 'color:#1a7a3a;' : 'color:#c0392b;'}">${consent_esign ? 'AGREED' : 'NOT RECORDED'}</span></div>
        <div class="row"><span class="label">Initials Completed</span><span class="value">${(initials_count || 0)} of 9${initials ? ' (' + initials + ')' : ''}</span></div>
        <div class="row"><span class="label">Signed (server time, UTC)</span><span class="value" style="font-size:12px;">${signedAtServer}</span></div>
        ${signed_at_client ? `<div class="row"><span class="label">Signed (device time)</span><span class="value" style="font-size:12px;">${signed_at_client}</span></div>` : ''}
        <div class="row"><span class="label">Signer IP</span><span class="value" style="font-size:12px;font-family:monospace;">${signerIp}</span></div>
        <div class="row"><span class="label">Device / Browser</span><span class="value" style="font-size:10px;color:#888;text-align:right;max-width:340px;word-break:break-word;">${signerUa}</span></div>
        ${consent_text ? `<div class="row" style="display:block;"><span class="label">Consent Statement</span><div style="font-size:11px;color:#666;margin-top:6px;line-height:1.5;">${consent_text}</div></div>` : ''}
      </div>`;

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
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #0a0a0a; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .row .label { color: #888; }
    .row .value { color: #1a1a1a; font-weight: 600; text-align: right; }
    .section-block { margin-bottom: 32px; }
    .sig-block { margin-top: 24px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .sig-block h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 0 0 12px 0; }
    .signature { font-family: 'Georgia', serif; font-size: 22px; font-style: italic; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 12px; }
    .sig-detail { font-size: 12px; color: #666; margin: 4px 0; }
    .total-row { background: #0a0a0a; color: #ffffff; display: flex; justify-content: space-between; padding: 16px 24px; border-radius: 8px; font-size: 16px; margin-top: 8px; }
    .total-row .label { opacity: 0.7; }
    .total-row .value { font-weight: 700; }
    .footer { background: #0a0a0a; color: rgba(255,255,255,0.5); padding: 24px 32px; text-align: center; font-size: 11px; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AARI.</h1>
      <p>NEW AGENT ONBOARDING SUMMARY</p>
    </div>
    <div class="body">

      <div class="section-block">
        <h2 class="section-title">Agent Contact Information</h2>
        <div class="row"><span class="label">Full Name</span><span class="value">${name}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${email}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${phone || 'N/A'}</span></div>
        <div class="row"><span class="label">License No.</span><span class="value">${license || 'N/A'}</span></div>
        <div class="row"><span class="label">MLS</span><span class="value">${mls || 'N/A'}</span></div>
        <div class="row"><span class="label">Years Licensed</span><span class="value">${years_licensed || 'N/A'}</span></div>
        <div class="row"><span class="label">Closings (Last 12 Mo.)</span><span class="value">${closings || 'N/A'}</span></div>
        ${region ? `<div class="row"><span class="label">Region</span><span class="value">${region}</span></div>` : ''}
        ${realtor_association ? `<div class="row"><span class="label">Realtor Association</span><span class="value">${realtor_association}</span></div>` : ''}
        ${how_did_you_hear ? `<div class="row"><span class="label">How They Heard About Us</span><span class="value">${how_did_you_hear}</span></div>` : ''}
      </div>

      <div class="section-block">
        <h2 class="section-title">Plan Selected</h2>
        <div class="row"><span class="label">Commission Plan</span><span class="value">${plan || 'N/A'}</span></div>
        <div class="row"><span class="label">Add-Ons</span><span class="value">${addons || 'None'}</span></div>
        <div class="row"><span class="label">Recurring Monthly</span><span class="value">${monthlyFormatted}</span></div>
      </div>

      ${subStatusBlock}

      <div class="section-block">
        <h2 class="section-title">Payment Receipt</h2>
        <div class="row"><span class="label">Date</span><span class="value">${date}</span></div>
        <div class="row"><span class="label">Payment ID</span><span class="value" style="font-size:11px;font-family:monospace;color:#888;">${payment_id || 'N/A'}</span></div>
        ${coupon_code && coupon_code !== 'None' ? `<div class="row"><span class="label">Coupon Code</span><span class="value" style="color:#27ae60;">${coupon_code}</span></div>` : ''}
        <div class="total-row">
          <span class="label">Amount Charged</span>
          <span class="value">${amountFormatted}</span>
        </div>
      </div>

      ${esignBlock}

      <div class="section-block">
        <h2 class="section-title">Signed ICA</h2>
        <div class="row"><span class="label">ICA Effective Date</span><span class="value">${ica_date || date}</span></div>
        <div style="display: flex; gap: 16px; margin-top: 16px;">
          <div class="sig-block" style="flex: 1;">
            <h3>Associate</h3>
            <div class="signature">${signature || name}</div>
            <p class="sig-detail"><strong>Name:</strong> ${name}</p>
            <p class="sig-detail"><strong>License:</strong> ${license || 'N/A'}</p>
            <p class="sig-detail"><strong>Date:</strong> ${ica_date || date}</p>
          </div>
          <div class="sig-block" style="flex: 1;">
            <h3>Qualifying Broker</h3>
            <div class="signature">Marlenyi Paredes</div>
            <p class="sig-detail"><strong>Name:</strong> Marlenyi Paredes</p>
            <p class="sig-detail"><strong>License:</strong> BK3527289</p>
            <p class="sig-detail"><strong>Date:</strong> ${ica_date || date}</p>
          </div>
        </div>
      </div>

    </div>
    <div class="footer">
      Aari Realty LLC &middot; 9160 Forum Corporate Pkwy Suite 350, Fort Myers, FL 33905<br>
      (239) 688-1770 &middot; join@aarirealty.com
    </div>
  </div>
</body>
</html>`;

    // Send to broker
    await resend.emails.send({
      from: 'Aari Realty <noreply@aarirealty.com>',
      to: 'join@aarirealty.com',
      subject: `New Agent Signed — ${name} (${plan || 'N/A'})`,
      html: html
    });

    // Send copy to applicant
    if (email) {
      await resend.emails.send({
        from: 'Aari Realty <noreply@aarirealty.com>',
        to: email,
        subject: `Welcome to Aari Realty — Your Onboarding Summary`,
        html: html
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send broker summary error:', err);
    return res.status(500).json({ error: 'Failed to send broker summary' });
  }
};
