var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/parse-license');
exports.handler = adapter(handler);
