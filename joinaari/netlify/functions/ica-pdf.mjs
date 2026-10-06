import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/ica-pdf.js');
export var config = { path: '/api/ica-pdf' };
export default vercelAdapter(handler);
