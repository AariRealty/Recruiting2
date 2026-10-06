var Buffer = require('buffer').Buffer;

module.exports = function vercelAdapter(handler) {
  return async function netlifyHandler(event) {
    var body;
    if (event.body) {
      try { body = JSON.parse(event.body); } catch (_) { body = event.body; }
    }

    var req = {
      method: event.httpMethod,
      headers: event.headers || {},
      query: event.queryStringParameters || {},
      body: body
    };

    var _status = 200;
    var _headers = {};
    var _body = '';
    var _isBase64 = false;

    var res = {
      status: function (code) { _status = code; return res; },
      setHeader: function (name, value) { _headers[name.toLowerCase()] = String(value); return res; },
      json: function (obj) {
        if (!_headers['content-type']) _headers['content-type'] = 'application/json';
        _body = JSON.stringify(obj);
        return res;
      },
      send: function (data) {
        if (Buffer.isBuffer(data)) {
          _body = data.toString('base64');
          _isBase64 = true;
        } else {
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
      _status = 500;
      _headers['content-type'] = 'application/json';
      _body = JSON.stringify({ error: 'Internal server error', detail: String(err && err.message) });
      _isBase64 = false;
    }

    return {
      statusCode: _status,
      headers: _headers,
      body: _body,
      isBase64Encoded: _isBase64
    };
  };
};
