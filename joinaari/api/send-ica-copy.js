const { Resend } = require('resend');

const SIGN_FN_URL = 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/functions/v1/realty-sign-ica-web';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;
const WEB_TOKEN = process.env.WEB_TOKEN;

// Realty-only Resend key (aarirealty.com verified). When REALTY_RESEND_API_KEY is set in Vercel,
// executed-ICA emails send from aarirealty.com via that key. Until then, fall back to the shared
// RESEND_API_KEY and send from aaritransactions.com (current behavior). No breakage window.
const REALTY_KEY = process.env.REALTY_RESEND_API_KEY || '';
const RESEND_KEY = REALTY_KEY || process.env.RESEND_API_KEY || '';
const FROM = REALTY_KEY ? 'Aari Realty <onboarding@aarirealty.com>' : 'Aari Realty <onboarding@aaritransactions.com>';

function esc(x) {
  return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
function firstName(f) {
  return String(f || '').trim().split(/\s+/)[0] || 'there';
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_ANON || !WEB_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const allowed = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', allowed.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, license, plan, signature } = req.body;
    if (!email || !name || !signature) return res.status(400).json({ error: 'email, name, and signature are required' });
    if (!RESEND_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    const resend = new Resend(RESEND_KEY);
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const firstNm = firstName(name);

    // 1) Build, store, and record the executed copy through the portal (the source of truth)
    let signed = null, signErr = null;
    try {
      const r = await fetch(SIGN_FN_URL, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: WEB_TOKEN, name: name, email: email, license: license || '', plan: plan || '', signature: signature, user_agent: req.headers['user-agent'] || '' })
      });
      const j = await r.json().catch(function () { return {}; });
      if (r.ok && j && j.ok) signed = j; else signErr = (j && (j.error || j.record_error)) || ('status ' + r.status);
    } catch (e) {
      signErr = String(e).slice(0, 160);
    }

    const detailLine = 'Agent: ' + esc(name) + (license ? ' &middot; License: ' + esc(license) : '') + (plan ? ' &middot; Plan: ' + esc(plan) : '') + ' &middot; Signed: ' + esc((signed && signed.signed_display) || formattedDate);

    if (signed) {
      const agentHtml =
        '<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:560px;color:#141210;line-height:1.6">' +
        '<div style="font-family:Georgia,serif;font-size:22px;font-weight:600;margin-bottom:12px">Your signed agreement is attached, ' + esc(firstNm) + '.</div>' +
        '<p style="font-size:14px">Thank you for signing your Aari Realty Independent Contractor Agreement. Your fully executed copy is attached to this email for your records. It includes the ICA, the Commission Structure Addendum, and Exhibit A, plus your signature certificate.</p>' +
        '<p style="font-size:12px;color:#5f5e5a;border-left:3px solid #e2e0d8;padding-left:12px">' + detailLine + '</p>' +
        '<p style="font-size:14px;margin-top:16px">Keep this copy somewhere safe. A copy is also on file with the brokerage.</p>' +
        '<hr style="border:none;border-top:1px solid #e2e0d8;margin:18px 0">' +
        '<p style="font-size:11px;color:#9b948a">Aari Realty LLC &middot; 9160 Forum Corporate Pkwy, Suite 350, Fort Myers, FL 33905 &middot; Broker of Record: Marlenyi L. Paredes &middot; License BK3530153</p>' +
        '</div>';
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: 'Your executed ICA, Aari Realty LLC (' + formattedDate + ')',
        html: agentHtml,
        attachments: [{ filename: signed.filename || 'Aari-Realty-ICA-signed.pdf', content: signed.pdf_base64 }]
      });
      return res.status(200).json({ success: true, pdf_path: signed.pdf_path, signature_id: signed.signature_id, pdf_base64: signed.pdf_base64, pdf_filename: signed.filename || 'Aari-Realty-ICA-signed.pdf' });
    }

    // Fallback: executed copy could not be generated. Alert the broker, acknowledge the agent, do not block signup.
    await resend.emails.send({
      from: FROM,
      to: 'join@aarirealty.com',
      subject: 'ACTION NEEDED: executed ICA copy failed for ' + name,
      html: '<p>Website signing succeeded but the executed PDF could not be generated or stored.</p><p>' + detailLine + '</p><p>Error: ' + esc(signErr || 'unknown') + '. Please generate and send the signed copy for this agent manually.</p>'
    });
    await resend.emails.send({
      from: FROM,
      to: email,
      cc: 'join@aarirealty.com',
      subject: 'We received your signature, Aari Realty LLC (' + formattedDate + ')',
      html: '<div style="font-family:-apple-system,Arial,sans-serif;max-width:560px;color:#141210;line-height:1.6"><p style="font-size:14px">Hi ' + esc(firstNm) + ', we received your signature on your Aari Realty Independent Contractor Agreement. Your fully executed copy will arrive shortly. If you do not see it within a day, reply to this email.</p><p style="font-size:11px;color:#9b948a">Aari Realty LLC &middot; License BK3530153</p></div>'
    });
    return res.status(200).json({ success: true, executed_copy: false, note: 'fallback sent; broker alerted' });
  } catch (err) {
    console.error('Send ICA copy error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
