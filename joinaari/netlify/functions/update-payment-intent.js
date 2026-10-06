var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/update-payment-intent');
exports.handler = adapter(handler);
