var adapter = require('./vercel-adapter');
var handler = require('../../api/validate-coupon');
exports.handler = adapter(handler);
