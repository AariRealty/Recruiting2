import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/finalize-join.js');
export var config = { path: '/api/finalize-join' };
export default vercelAdapter(handler);
