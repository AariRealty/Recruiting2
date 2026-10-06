var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/setup-recurring');
exports.handler = adapter(handler);
