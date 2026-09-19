var PROXY_URL = 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/functions/v1/send-email-proxy';

module.exports = async function sendViaProxy(opts) {
  var anon = process.env.SUPABASE_ANON_KEY;
  if (!anon) throw new Error('SUPABASE_ANON_KEY not configured');

  var r = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'apikey': anon,
      'Authorization': 'Bearer ' + anon,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opts),
  });

  var j = await r.json().catch(function () { return {}; });
  if (!r.ok || !j.ok) throw new Error(j.err || j.error || 'send-email-proxy: ' + r.status);
  return j;
};
