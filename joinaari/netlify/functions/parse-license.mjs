import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/parse-license.js';
export var config = { path: '/api/parse-license' };
export default vercelAdapter(handler);
