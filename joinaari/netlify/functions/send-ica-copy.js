var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/send-ica-copy');
exports.handler = adapter(handler);
