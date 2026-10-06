import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
// Temporary, until @sparticuz/chromium is upgraded past 131.
// Version 131 picks its system library pack from these two variables and only knows
// 20.x and 22.x for Amazon Linux 2023. On Node 24 it unpacks the Amazon Linux 2 pack,
// which has no libnspr4.so, and the browser cannot start. Node 24 runs on the same
// Amazon Linux 2023 as Node 22, so name 22.x for the library. This is read inside this
// function only. It does not change the runtime.
process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs22.x';
process.env.AWS_LAMBDA_JS_RUNTIME = 'nodejs22.x';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/ica-pdf.js');
export var config = { path: '/api/ica-pdf' };
export default vercelAdapter(handler);
