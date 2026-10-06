var adapter = require('./vercel-adapter');
var handler = require('../../api/chatbot-escalation');
exports.handler = adapter(handler);
