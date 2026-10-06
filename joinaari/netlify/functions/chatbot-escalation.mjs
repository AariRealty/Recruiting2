import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/chatbot-escalation.js';
export var config = { path: '/api/chatbot-escalation' };
export default vercelAdapter(handler);
