var sendViaProxy = require('./_send-via-proxy');
var spreadsheetB64 = require('./_spreadsheet');

var SB_URL = 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/rest/v1';

function sbFetch(path, svcKey, opts) {
  var url = SB_URL + path;
  var headers = Object.assign({ 'apikey': svcKey, 'Authorization': 'Bearer ' + svcKey }, (opts && opts.headers) || {});
  return fetch(url, Object.assign({}, opts, { headers: headers }));
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function page(title, body) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + title + ' | Aari Realty</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">' +
    '<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Montserrat,sans-serif;background:#fff;color:#141210;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center}' +
    '.card{max-width:460px}h1{font-family:"Cormorant Garamond",serif;font-size:clamp(28px,5vw,40px);font-weight:500;line-height:1.1;margin-bottom:16px}' +
    'p{font-size:14px;line-height:1.7;color:#6b6b6b;margin-bottom:12px}a{color:#141210;text-decoration:underline;text-underline-offset:3px}</style></head>' +
    '<body><div class="card">' + body + '</div></body></html>';
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  var token = String(req.query.t || '').trim();
  if (!token || token.length < 32) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(page('Invalid Link', '<h1>That link is not valid.</h1><p>If you copied it from an email, make sure you got the full URL.</p><p><a href="https://joinaari.com/cost">Back to the calculator</a></p>'));
  }

  var svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!svcKey) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(page('Error', '<h1>Something went wrong.</h1><p>Please try again later or email <a href="mailto:join@aarirealty.com">join@aarirealty.com</a>.</p>'));
  }

  try {
    var lookupRes = await sbFetch(
      '/realty_leads?confirm_token=eq.' + encodeURIComponent(token) + '&select=id,email,first_name,confirmed_at',
      svcKey
    );
    if (!lookupRes.ok) throw new Error('DB lookup failed');
    var leads = await lookupRes.json();
    if (!leads || leads.length === 0) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(page('Not Found', '<h1>We could not find that link.</h1><p>It may have already been used or expired.</p><p><a href="https://joinaari.com/cost">Back to the calculator</a></p>'));
    }

    var lead = leads[0];

    if (lead.confirmed_at) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(page('Already Confirmed', '<h1>You are already confirmed, ' + esc(lead.first_name || 'there') + '.</h1><p>Check your inbox for the spreadsheet we sent earlier. If you cannot find it, email <a href="mailto:join@aarirealty.com">join@aarirealty.com</a>.</p>'));
    }

    await sbFetch('/realty_leads?id=eq.' + lead.id, svcKey, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed_at: new Date().toISOString() }),
    });

    var firstName = lead.first_name || 'there';
    try {
      await sendViaProxy({
        lane: 'attraction',
        to: lead.email,
        subject: 'Your cost comparison spreadsheet',
        html: '<pre style="font-family:Montserrat,-apple-system,sans-serif;font-size:14px;line-height:1.8;color:#141210;white-space:pre-wrap;max-width:520px;">' +
          'Here it is, ' + esc(firstName) + '.\n\n' +
          'The spreadsheet is attached. Every formula is live,\nso change the numbers and it recalculates.\n\n' +
          'If you have questions about what you see, reply to this\nemail or text me at 239.688.1771.\n\n' +
          'Marlenyi\n\n' +
          'Broker, Aari Realty LLC\n' +
          '9160 Forum Corporate Pkwy, Suite 350, Fort Myers, FL 33905</pre>',
        emailType: 'lead_asset_delivery',
        attachments: [{ filename: 'Aari-Cost-Comparison.xlsx', content: spreadsheetB64 }],
      });
    } catch (e) {
      console.error('[confirm] asset delivery email failed:', e.message);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(page('Confirmed', '<h1>Done. Check your inbox, ' + esc(firstName) + '.</h1><p>The spreadsheet is on its way. Every formula is live, so change the numbers and it recalculates.</p><p style="margin-top:20px"><a href="https://joinaari.com/commission-plans">See the full commission plans</a></p>'));
  } catch (err) {
    console.error('Confirm error:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(page('Error', '<h1>Something went wrong.</h1><p>Please try again or email <a href="mailto:join@aarirealty.com">join@aarirealty.com</a>.</p>'));
  }
};
