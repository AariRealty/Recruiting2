var adapter = require('./vercel-adapter');
var handler = require('../../api/create-payment-intent');
exports.handler = adapter(handler);
