import vercelAdapter from '../lib/vercel-adapter.mjs';
import handler from '../../api/blog.js';

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
