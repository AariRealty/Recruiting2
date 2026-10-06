var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/blog');

var inner = adapter(handler);

exports.handler = async function (event) {
  var qs = event.queryStringParameters || {};
  if (!qs.slug) {
    var m = (event.path || '').match(/^\/blog\/([a-z0-9][a-z0-9-]{0,119})$/);
    if (m) {
      qs = Object.assign({}, qs, { slug: m[1] });
      event = Object.assign({}, event, { queryStringParameters: qs });
    }
  }
  return inner(event);
};
