var adapter = require('../lib/vercel-adapter');
var handler = require('../../api/chatbot-escalation');
exports.handler = adapter(handler);
