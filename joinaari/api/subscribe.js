var sendViaProxy = require('./_send-via-proxy');
var crypto = require('crypto');

var SB_URL = 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/rest/v1';

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getIp(req) {
  var xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.headers['x-real-ip'] || '127.0.0.1';
}

function sbFetch(path, svcKey, opts) {
  var url = SB_URL + path;
  var headers = Object.assign({ 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey }, (opts && opts.headers) || {});
  return fetch(url, Object.assign({}, opts, { headers: headers }));
}

module.exports = async function handler(req, res) {
  var allowed = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', allowed.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!svcKey) return res.status(500).json({ error: 'Server configuration error' });

    var body = req.body || {};
    var email = String(body.email || '').trim().toLowerCase();
    var firstName = String(body.first_name || '').trim();
    var source = String(body.source || '').trim();
    var list = String(body.list || 'agent_newsletter').trim();
    var consentText = String(body.consent_text || '').trim();
    var consentedAt = body.consented_at || new Date().toISOString();

    if (body.company) return res.status(200).json({ ok: true });

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    if (!firstName) return res.status(400).json({ error: 'First name required' });

    var ip = getIp(req);

    var oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    var rateRes = await sbFetch(
      '/realty_leads?consent_ip=eq.' + ip + '&created_at=gte.' + encodeURIComponent(oneHourAgo) + '&select=id',
      svcKey
    );
    if (rateRes.ok) {
      var recent = await rateRes.json();
      if (recent.length >= 5) return res.status(200).json({ ok: true });
    }

    var suppRes = await sbFetch(
      '/realty_recruits?email=eq.' + encodeURIComponent(email) + '&do_not_contact=eq.true&select=id',
      svcKey
    );
    var suppressed = false;
    if (suppRes.ok) {
      var suppRows = await suppRes.json();
      if (suppRows.length > 0) suppressed = true;
    }

    var existRes = await sbFetch(
      '/realty_leads?email=eq.' + encodeURIComponent(email) + '&select=id,unsubscribed_at,confirmed_at,confirm_token',
      svcKey
    );

    var token = crypto.randomBytes(32).toString('hex');
    var existing = null;
    if (existRes.ok) {
      var leads = await existRes.json();
      if (leads.length > 0) existing = leads[0];
    }

    if (existing) {
      if (existing.unsubscribed_at) {
        await sbFetch('/realty_leads?id=eq.' + existing.id, svcKey, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unsubscribed_at: null,
            first_name: firstName,
            source: source,
            list_name: list,
            consent_text: consentText,
            consented_at: consentedAt,
            consent_ip: ip,
            confirm_token: token,
            confirmed_at: null,
            confirm_sent_at: null,
          }),
        });
      } else if (existing.confirmed_at) {
        return res.status(200).json({ ok: true });
      } else {
        token = existing.confirm_token || token;
        if (!existing.confirm_token) {
          await sbFetch('/realty_leads?id=eq.' + existing.id, svcKey, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirm_token: token }),
          });
        }
      }
    } else {
      await sbFetch('/realty_leads', svcKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          email: email,
          first_name: firstName,
          source: source,
          list_name: list,
          consent_text: consentText,
          consented_at: consentedAt,
          consent_ip: ip,
          confirm_token: token,
          user_agent: req.headers['user-agent'] || '',
        }),
      });
    }

    if (!suppressed) {
      var confirmUrl = 'https://joinaari.com/confirm?t=' + token;
      try {
        await sendViaProxy({
          lane: 'attraction',
          to: email,
          subject: 'your spreadsheet',
          html: '<pre style="font-family:Montserrat,-apple-system,sans-serif;font-size:14px;line-height:1.8;color:#141210;white-space:pre-wrap;max-width:520px;">' +
            'One click and it is yours, ' + esc(firstName) + '.\n\n' +
            '<a href="' + confirmUrl + '" style="color:#141210;">' + confirmUrl + '</a>\n\n' +
            'That link tells me you actually wanted this, which is the only\nreason I am asking you to click anything.\n\n' +
            'Marlenyi\n\n' +
            'Broker, Aari Realty LLC\n' +
            '9160 Forum Corporate Pkwy, Suite 350, Fort Myers, FL 33905</pre>',
          emailType: 'lead_confirm',
        });
        var patchId = existing ? existing.id : null;
        if (patchId) {
          await sbFetch('/realty_leads?id=eq.' + patchId, svcKey, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirm_sent_at: new Date().toISOString() }),
          });
        } else {
          await sbFetch('/realty_leads?email=eq.' + encodeURIComponent(email), svcKey, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirm_sent_at: new Date().toISOString() }),
          });
        }
      } catch (e) {
        console.error('[subscribe] confirmation email failed:', e.message);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
