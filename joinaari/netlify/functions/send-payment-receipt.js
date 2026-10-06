var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/send-payment-receipt');
exports.handler = adapter(handler);
