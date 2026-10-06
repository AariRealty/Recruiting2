import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/send-ica-copy.js';
export var config = { path: '/api/send-ica-copy' };
export default vercelAdapter(handler);
