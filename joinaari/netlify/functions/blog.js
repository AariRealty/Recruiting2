var adapter = require('./vercel-adapter');
var handler = require('../../api/blog');
exports.handler = adapter(handler);
