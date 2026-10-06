import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/validate-coupon.js');
export var config = { path: '/api/validate-coupon' };
export default vercelAdapter(handler);
