import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/chatbot-escalation.js');
export var config = { path: '/api/chatbot-escalation' };
export default vercelAdapter(handler);
