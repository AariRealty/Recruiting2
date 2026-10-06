var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/finalize-join');
exports.handler = adapter(handler);
