var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/ica-pdf');
exports.handler = adapter(handler);
