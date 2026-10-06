import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/update-payment-intent.js';
export var config = { path: '/api/update-payment-intent' };
export default vercelAdapter(handler);
