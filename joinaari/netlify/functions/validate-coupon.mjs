import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/validate-coupon.js';
export var config = { path: '/api/validate-coupon' };
export default vercelAdapter(handler);
