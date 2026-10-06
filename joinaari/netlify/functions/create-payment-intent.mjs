import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/create-payment-intent.js';
export var config = { path: '/api/create-payment-intent' };
export default vercelAdapter(handler);
