const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  const __allowedOrigins = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', __allowedOrigins.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { contact, messages, page } = req.body;

    if (!messages || !messages.length) {
      return res.status(400).json({ error: 'messages required' });
    }

    const apiKey = process.env.REALTY_RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Resend API key not configured' });
    }

    const resend = new Resend(apiKey);
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' });
    const pageName = (page || '/').replace(/^\//, '').replace(/\.html$/, '') || 'homepage';

    const transcript = messages.map(function(m) {
      if (m.type === 'user') {
        return '<div style="margin:6px 0;padding:10px 14px;background:#141210;color:#fff;border-radius:14px 14px 4px 14px;max-width:80%;margin-left:auto;font-size:13px;line-height:1.5;text-align:right;">' + escapeHtml(m.text) + '</div>';
      }
      return '<div style="margin:6px 0;padding:10px 14px;background:#f5f4f1;border:1px solid #e7e4dc;border-radius:14px 14px 14px 4px;max-width:80%;font-size:13px;line-height:1.5;color:#141210;">' + escapeHtml(m.text) + '</div>';
    }).join('');

    const fromAddr = process.env.REALTY_RESEND_API_KEY
      ? 'Ask Aari <onboarding@aarirealty.com>'
      : 'Ask Aari <onboarding@aaritransactions.com>';

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; }
    .header { background: #0a0a0a; color: #ffffff; padding: 32px; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 300; letter-spacing: 6px; margin: 0; }
    .header p { font-size: 12px; letter-spacing: 2px; opacity: 0.6; margin-top: 8px; }
    .body { padding: 32px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #0a0a0a; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .info-row .label { color: #888; }
    .info-row .value { color: #1a1a1a; font-weight: 600; text-align: right; }
    .alert { background: #fff8e1; border-left: 4px solid #f9a825; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 14px; line-height: 1.6; }
    .transcript { background: #fafaf8; border: 1px solid #e7e4dc; border-radius: 12px; padding: 20px; margin-top: 12px; }
    .footer { background: #0a0a0a; color: rgba(255,255,255,0.5); padding: 24px 32px; text-align: center; font-size: 11px; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://joinaari.com/logo.png" alt="Aari Realty" style="height:48px;width:auto;filter:brightness(0)invert(1);" />
      <p>CHATBOT ESCALATION</p>
    </div>
    <div class="body">
      <div class="alert">
        A visitor on <strong>joinaari.com/${escapeHtml(pageName)}</strong> asked questions the chatbot couldn't answer. They were prompted to leave their contact info so you can follow up personally.
      </div>

      <div style="margin-bottom:32px;">
        <h2 class="section-title">Visitor Info</h2>
        <div class="info-row"><span class="label">Contact Provided</span><span class="value">${escapeHtml(contact || 'Not provided')}</span></div>
        <div class="info-row"><span class="label">Page</span><span class="value">joinaari.com/${escapeHtml(pageName)}</span></div>
        <div class="info-row"><span class="label">Date</span><span class="value">${date}</span></div>
        <div class="info-row"><span class="label">Time (ET)</span><span class="value">${time}</span></div>
      </div>

      <div>
        <h2 class="section-title">Full Conversation</h2>
        <div class="transcript">
          ${transcript}
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

    await resend.emails.send({
      from: fromAddr,
      to: 'join@aarirealty.com',
      subject: `Chatbot Escalation — ${contact || 'Visitor on ' + pageName}`,
      html: html
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Chatbot escalation error:', err);
    return res.status(500).json({ error: 'Failed to send escalation email' });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
