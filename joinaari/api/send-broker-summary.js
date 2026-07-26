const { Resend } = require('resend');

const REALTY_KEY = process.env.REALTY_RESEND_API_KEY || '';
const RESEND_KEY = REALTY_KEY || process.env.RESEND_API_KEY || '';
const FROM = REALTY_KEY ? 'Aari Realty <onboarding@aarirealty.com>' : 'Aari Realty <onboarding@aaritransactions.com>';

function esc(x) {
  return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

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
      pdf_base64, pdf_filename
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    if (!RESEND_KEY) {
      return res.status(500).json({ error: 'Resend API key not configured' });
    }

    const resend = new Resend(RESEND_KEY);
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const amountFormatted = amount ? '$' + Number(amount).toFixed(2) : 'N/A';
    const monthlyFormatted = monthly_amount ? '$' + Number(monthly_amount).toFixed(2) + '/mo' : 'N/A';

    function row(label, value, style) {
      return '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;"><span style="color:#888;">' + label + '</span><span style="color:#1a1a1a;font-weight:600;text-align:right;' + (style || '') + '">' + value + '</span></div>';
    }

    const html = `<!DOCTYPE html>
<html>
<head></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;background:#f5f5f5;margin:0;padding:0;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:#0a0a0a;padding:32px;text-align:center;">
      <img src="https://joinaari.com/logo.png" alt="Aari Realty" style="height:48px;width:auto;filter:brightness(0)invert(1);" />
    </div>
    <div style="padding:32px;">
      <p style="font-size:18px;font-weight:600;margin:0 0 6px;">New agent just signed.</p>
      <p style="font-size:14px;color:#888;margin:0 0 28px;line-height:1.5;">${esc(name)} completed onboarding and signed the ICA.${pdf_base64 ? ' The executed contract is attached.' : ''}</p>

      <div style="margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 14px;padding-bottom:8px;border-bottom:2px solid #0a0a0a;">Agent Info</div>
        ${row('Name', esc(name))}
        ${row('Email', esc(email))}
        ${row('Phone', esc(phone || 'N/A'))}
        ${row('License', esc(license || 'N/A'))}
        ${mls ? row('MLS', esc(mls)) : ''}
        ${years_licensed ? row('Years Licensed', esc(years_licensed)) : ''}
        ${closings ? row('Closings (12 Mo.)', esc(closings)) : ''}
        ${region ? row('Region', esc(region)) : ''}
        ${how_did_you_hear ? row('How They Found Us', esc(how_did_you_hear)) : ''}
      </div>

      <div style="margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 14px;padding-bottom:8px;border-bottom:2px solid #0a0a0a;">Plan & Payment</div>
        ${row('Plan', esc(plan || 'N/A'))}
        ${row('Monthly', esc(monthlyFormatted))}
        ${addons && addons !== 'None' ? row('Add-Ons', esc(addons)) : ''}
        ${coupon_code && coupon_code !== 'None' ? row('Coupon', esc(coupon_code), 'color:#27ae60;') : ''}
        ${row('Date', date)}
        <div style="background:#0a0a0a;color:#fff;display:flex;justify-content:space-between;padding:16px 24px;border-radius:8px;font-size:16px;margin-top:8px;">
          <span style="opacity:0.7;">Amount Charged</span>
          <span style="font-weight:700;">${amountFormatted}</span>
        </div>
      </div>

      <div style="margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 14px;padding-bottom:8px;border-bottom:2px solid #0a0a0a;">Signature</div>
        ${row('ICA Signed', 'Yes', 'color:#1a7a3a;')}
        ${row('Effective Date', esc(ica_date || date))}
        ${row('Signed By', esc(signature || name))}
      </div>
    </div>
    <div style="background:#0a0a0a;color:rgba(255,255,255,0.5);padding:24px 32px;text-align:center;font-size:11px;line-height:1.8;">
      Aari Realty LLC &middot; 9160 Forum Corporate Pkwy Suite 350, Fort Myers, FL 33905<br>
      (239) 688-1770 &middot; join@aarirealty.com
    </div>
  </div>
</body>
</html>`;

    const emailOpts = {
      from: FROM,
      to: 'join@aarirealty.com',
      subject: 'New Agent Signed — ' + name + ' (' + (plan || 'N/A') + ')',
      html: html
    };
    if (pdf_base64 && pdf_filename) {
      emailOpts.attachments = [{ filename: pdf_filename, content: pdf_base64 }];
    }

    await resend.emails.send(emailOpts);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send broker summary error:', err);
    return res.status(500).json({ error: 'Failed to send broker summary' });
  }
};
