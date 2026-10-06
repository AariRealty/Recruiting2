var adapter = require('./vercel-adapter');
var handler = require('../../api/update-payment-intent');
exports.handler = adapter(handler);
