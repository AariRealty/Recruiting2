import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/send-payment-receipt.js';
export var config = { path: '/api/send-payment-receipt' };
export default vercelAdapter(handler);
