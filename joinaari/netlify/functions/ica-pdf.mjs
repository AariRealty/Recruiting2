import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/ica-pdf.js';
export var config = { path: '/api/ica-pdf' };
export default vercelAdapter(handler);
