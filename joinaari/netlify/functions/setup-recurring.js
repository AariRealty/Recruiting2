var adapter = require('./vercel-adapter');
var handler = require('../../api/setup-recurring');
exports.handler = adapter(handler);
