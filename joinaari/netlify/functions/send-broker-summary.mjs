import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/send-broker-summary.js');
export var config = { path: '/api/send-broker-summary' };
export default vercelAdapter(handler);
