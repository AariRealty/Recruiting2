import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/setup-recurring.js');
export var config = { path: '/api/setup-recurring' };
export default vercelAdapter(handler);
