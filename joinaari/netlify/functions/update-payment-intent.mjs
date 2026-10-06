import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/update-payment-intent.js');
export var config = { path: '/api/update-payment-intent' };
export default vercelAdapter(handler);
