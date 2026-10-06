import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/setup-recurring.js';
export var config = { path: '/api/setup-recurring' };
export default vercelAdapter(handler);
