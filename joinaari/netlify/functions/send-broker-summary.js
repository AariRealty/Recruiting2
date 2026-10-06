var adapter = require('./vercel-adapter');
var handler = require('../../api/send-broker-summary');
exports.handler = adapter(handler);
