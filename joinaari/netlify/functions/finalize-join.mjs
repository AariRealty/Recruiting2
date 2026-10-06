import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/finalize-join.js';
export var config = { path: '/api/finalize-join' };
export default vercelAdapter(handler);
