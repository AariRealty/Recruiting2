import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/send-ica-copy.js');
export var config = { path: '/api/send-ica-copy' };
export default vercelAdapter(handler);
