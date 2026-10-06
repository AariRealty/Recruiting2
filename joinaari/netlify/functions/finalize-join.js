var adapter = require('./vercel-adapter');
var handler = require('../../api/finalize-join');
exports.handler = adapter(handler);
