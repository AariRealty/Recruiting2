import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/parse-license.js');
export var config = { path: '/api/parse-license' };
export default vercelAdapter(handler);
