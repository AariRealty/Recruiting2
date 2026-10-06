import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/send-payment-receipt.js');
export var config = { path: '/api/send-payment-receipt' };
export default vercelAdapter(handler);
