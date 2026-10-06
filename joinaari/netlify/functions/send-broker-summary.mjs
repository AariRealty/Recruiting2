import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/send-broker-summary.js';
export var config = { path: '/api/send-broker-summary' };
export default vercelAdapter(handler);
