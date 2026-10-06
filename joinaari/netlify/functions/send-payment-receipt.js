var adapter = require('./vercel-adapter');
var handler = require('../../api/send-payment-receipt');
exports.handler = adapter(handler);
