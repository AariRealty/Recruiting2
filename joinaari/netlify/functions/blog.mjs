import { createRequire } from 'node:module';
import vercelAdapter from '../lib/vercel-adapter.mjs';
var nodeRequire = createRequire(import.meta.url);
var handler = nodeRequire('../../api/blog.js');

var adapted = vercelAdapter(handler);

export var config = {
  path: ['/api/blog', '/blog', '/blog/', '/blog/:slug']
};

export default async function (request, context) {
  var slug = (context.params && context.params.slug) || '';
  if (slug) {
    var url = new URL(request.url);
    if (!url.searchParams.has('slug')) {
      url.searchParams.set('slug', slug);
      request = new Request(url.toString(), request);
    }
  }
  return adapted(request, context);
}
