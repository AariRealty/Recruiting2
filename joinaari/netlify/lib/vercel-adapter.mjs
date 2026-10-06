export default function vercelAdapter(handler) {
  return async function (request) {
    var url = new URL(request.url);
    var query = {};
    url.searchParams.forEach(function (v, k) { query[k] = v; });

    var headers = {};
    request.headers.forEach(function (v, k) { headers[k] = v; });

    var body;
    var text = await request.text();
    if (text) {
      try { body = JSON.parse(text); } catch (_) { body = text; }
    }

    var req = {
      method: request.method,
      headers: headers,
      query: query,
      body: body
    };

    var _status = 200;
    var _headers = {};
    var _body = null;

    var res = {
      status: function (code) { _status = code; return res; },
      setHeader: function (name, value) { _headers[name.toLowerCase()] = String(value); return res; },
      json: function (obj) {
        if (!_headers['content-type']) _headers['content-type'] = 'application/json';
        _body = JSON.stringify(obj);
        return res;
      },
      send: function (data) {
        if (data instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(data))) {
          if (!_headers['content-type']) _headers['content-type'] = 'application/octet-stream';
          _body = data;
        } else {
          if (!_headers['content-type']) _headers['content-type'] = 'text/html; charset=utf-8';
          _body = String(data);
        }
        return res;
      },
      end: function () { return res; }
    };

    try {
      await handler(req, res);
    } catch (err) {
      console.error('vercel-adapter caught:', err);
      _headers['content-type'] = 'application/json';
      _status = 500;
      _body = JSON.stringify({ error: 'Internal server error' });
    }

    return new Response(_body, {
      status: _status,
      headers: _headers
    });
  };
}
