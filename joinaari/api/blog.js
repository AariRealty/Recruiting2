// Public blog for joinaari.com — SERVER RENDERED so Google actually sees it.
//   /blog        -> index of published posts
//   /blog/:slug  -> one post
// Routing comes from vercel.json rewrites. Content comes from the realty-blog
// edge function, which is the only public door to public.realty_posts and never
// returns drafts. Authoring lives in the Agent Hub.

const BLOG_FN = 'https://fnlrgmuvtgwzjsihqxcn.supabase.co/functions/v1/realty-blog';
const SITE = 'https://joinaari.com';

// ---- escaping. body_html is broker-authored so it renders as-is; everything
// ---- that lands in an attribute or a text node gets escaped.
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const fmtDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
  } catch (_e) { return ''; }
};

const CSS = `
:root{--ink:#141210;--black:#0a0a0a;--bg:#faf9f7;--cream:#f5f0e8;--off:#f5f4f1;--border:#e2e0d8;--mid:#6b6b6b;--lite:#9b948a;--taupe:#8a827a}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Montserrat',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
a{color:inherit}
nav{position:sticky;top:0;z-index:60;display:flex;align-items:center;justify-content:space-between;padding:16px 44px;background:rgba(250,249,247,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}
.brand{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;text-decoration:none;line-height:1}
.brand small{display:block;font-family:'Montserrat',sans-serif;font-size:8.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--lite);margin-top:3px}
.nav-right{display:flex;align-items:center;gap:22px}
.nav-link{font-size:12px;font-weight:600;color:var(--mid);text-decoration:none}
.nav-link:hover{color:var(--ink)}
.btn-dark{background:var(--ink);color:#fff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:13px 22px;border-radius:50px;text-decoration:none;white-space:nowrap}
.wrap{max-width:760px;margin:0 auto;padding:0 24px}

.bhead{padding:66px 24px 40px;text-align:center;border-bottom:1px solid var(--border)}
.beb{font-size:10px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:var(--taupe)}
.bhead h1{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(36px,5vw,54px);line-height:1.03;margin:14px auto 16px;max-width:16ch}
.bhead h1 em{font-style:italic;color:var(--taupe)}
.bhead p{font-size:15px;color:var(--mid);line-height:1.7;max-width:52ch;margin:0 auto}

.plist{max-width:760px;margin:0 auto;padding:10px 24px 70px}
.pcard{display:block;text-decoration:none;padding:34px 0;border-bottom:1px solid var(--border)}
.pcard:hover h2{color:var(--taupe)}
.pmeta{font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--lite)}
.pcard h2{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(24px,3vw,32px);line-height:1.15;margin:10px 0 9px;transition:color .2s}
.pcard p{font-size:14.5px;color:var(--mid);line-height:1.7}
.pgo{display:inline-block;margin-top:13px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid var(--border);padding-bottom:3px}

.empty{text-align:center;padding:70px 24px 90px;color:var(--mid)}
.empty p{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;color:var(--taupe)}

article{padding:56px 0 20px}
.back{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--lite);text-decoration:none;margin-bottom:26px}
.back:hover{color:var(--ink)}
article h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(32px,4.6vw,50px);line-height:1.06;margin:12px 0 14px}
.byline{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--lite);margin-bottom:30px}
.cover{width:100%;border-radius:14px;margin:0 0 34px;display:block}
.body{font-size:17px;line-height:1.8;color:#2e2b27}
.body p{margin:0 0 24px}
.body h2{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.2;margin:42px 0 14px}
.body ul,.body ol{margin:0 0 24px;padding-left:22px}
.body li{margin-bottom:9px}
.body b,.body strong{font-weight:700;color:var(--ink)}
.body i,.body em{font-style:italic}
.body a{color:var(--taupe);font-weight:600;text-decoration:underline;text-underline-offset:3px}
.body blockquote{border-left:3px solid var(--border);padding-left:20px;margin:0 0 24px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:21px;color:var(--taupe)}

.endcap{margin:52px 0 0;padding:40px 34px;background:var(--cream);border-radius:18px;text-align:center}
.endcap .eb{font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--taupe)}
.endcap h3{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(26px,3.4vw,34px);line-height:1.1;margin:12px auto 12px;max-width:18ch}
.endcap h3 em{font-style:italic;color:var(--taupe)}
.endcap p{font-size:14px;color:#5f5b52;line-height:1.65;max-width:44ch;margin:0 auto 22px}
.endcap a{display:inline-block;background:var(--ink);color:#fff;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:15px 30px;border-radius:50px;text-decoration:none}

footer{background:var(--black);color:#fff;margin-top:70px;padding:52px 44px 30px}
.fgrid{max-width:1080px;margin:0 auto 34px;display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:34px}
.fbrand{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;margin-bottom:11px}
.ftag{font-size:12.5px;color:rgba(255,255,255,.5);line-height:1.7;max-width:44ch}
.flic{font-size:11px;color:rgba(255,255,255,.35);margin-top:12px}
footer h4{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:13px}
footer a{display:block;font-size:12.5px;color:rgba(255,255,255,.62);text-decoration:none;margin-bottom:8px}
footer a:hover{color:#fff}
.fbot{max-width:1080px;margin:0 auto;padding-top:22px;border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:11px;color:rgba(255,255,255,.35)}
.fbot a{display:inline-block;margin-left:16px;font-size:11px}
@media(max-width:860px){nav{padding:14px 20px}.nav-link,.nav-phone{display:none}.fgrid{grid-template-columns:1fr;gap:24px}footer{padding:44px 22px 26px}.bhead{padding:48px 20px 32px}}
`;

const NAV = `<nav>
  <a class="brand" href="/">Aari Realty<small>Southwest Florida Brokerage</small></a>
  <div class="nav-right">
    <a class="nav-link" href="/#plans">Plans</a>
    <a class="nav-link" href="/mentorship.html">Mentorship</a>
    <a class="nav-link" href="/blog">Blog</a>
    <a class="nav-link" href="/#faq">FAQ</a>
    <a class="nav-link" href="https://hub.joinaari.com" target="_blank" rel="noopener">Log in</a>
    <a class="btn-dark" href="/#plans">Start Your Application &rarr;</a>
  </div>
</nav>`;

const FOOTER = `<footer>
  <div class="fgrid">
    <div>
      <div class="fbrand">Aari Realty</div>
      <p class="ftag">A fully virtual Southwest Florida brokerage built for agents who want real support, fair splits, and the systems to grow.</p>
      <p class="flic">Marlenyi Paredes, Broker Owner &middot; License BK3530153</p>
    </div>
    <div>
      <h4>The ecosystem</h4>
      <a href="/#plans">Aari Realty</a>
      <a href="https://aaritransactions.com" target="_blank" rel="noopener">Aari Transactions</a>
      <a href="https://aaritransactions.com/aari-referrals.html" target="_blank" rel="noopener">Aari Referrals</a>
    </div>
    <div>
      <h4>Get in touch</h4>
      <a href="tel:2396881770">239.688.1770</a>
      <a href="/#plans">Start your application</a>
      <a href="/blog">Read the blog</a>
    </div>
  </div>
  <div class="fbot">
    <span>&copy; 2026 Aari Realty LLC. All rights reserved. Equal Housing Opportunity.</span>
    <span><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></span>
  </div>
</footer>`;

function shell({ title, desc, canonical, ogImage, jsonLd, body }) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${jsonLd && jsonLd['@type'] === 'BlogPosting' ? 'article' : 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}">` : ''}
<meta name="theme-color" content="#0a0a0a">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
<style>${CSS}</style>
</head><body>${NAV}${body}${FOOTER}</body></html>`;
}

const ENDCAP = `<div class="endcap">
  <span class="eb">Not ready to switch?</span>
  <h3>Then don&rsquo;t. <em>Just stop learning this the hard way.</em></h3>
  <p>Compliance, contracts, forms, and the law changes that actually hit your deals. Straight to your inbox. Free.</p>
  <a href="/#stay">Get the next one &rarr;</a>
</div>`;

module.exports = async function handler(req, res) {
  try {
    const slug = (req.query && req.query.slug ? String(req.query.slug) : '').trim();

    // -------- single post --------
    if (slug) {
      if (!/^[a-z0-9-]{1,120}$/.test(slug)) { res.status(404).send(notFound()); return; }
      const r = await fetch(`${BLOG_FN}?slug=${encodeURIComponent(slug)}`);
      if (!r.ok) { res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8'); res.send(notFound()); return; }
      const { post } = await r.json();
      if (!post) { res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8'); res.send(notFound()); return; }

      const title = post.seo_title || post.title;
      const desc = post.seo_description || post.excerpt || '';
      const canonical = `${SITE}/blog/${post.slug}`;
      const dateStr = fmtDate(post.published_at || post.created_at);

      const html = shell({
        title: `${title} · Aari Realty`,
        desc, canonical, ogImage: post.cover_url || null,
        jsonLd: {
          '@context': 'https://schema.org', '@type': 'BlogPosting',
          headline: post.title, description: desc,
          datePublished: post.published_at || post.created_at,
          author: { '@type': 'Person', name: post.author_name || 'Marlenyi Paredes' },
          publisher: { '@type': 'Organization', name: 'Aari Realty LLC' },
          mainEntityOfPage: canonical,
          ...(post.cover_url ? { image: post.cover_url } : {}),
        },
        body: `<div class="wrap"><article>
  <a class="back" href="/blog">&larr; All posts</a>
  <h1>${esc(post.title)}</h1>
  <div class="byline">${esc(post.author_name || 'Marlenyi Paredes')}${dateStr ? ' &middot; ' + esc(dateStr) : ''}</div>
  ${post.cover_url ? `<img class="cover" src="${esc(post.cover_url)}" alt="${esc(post.title)}">` : ''}
  <div class="body">${post.body_html || ''}</div>
  ${ENDCAP}
</article></div>`,
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
      res.status(200).send(html);
      return;
    }

    // -------- index --------
    const r = await fetch(BLOG_FN);
    const { posts = [] } = r.ok ? await r.json() : { posts: [] };

    const list = posts.length
      ? posts.map((p) => `<a class="pcard" href="/blog/${esc(p.slug)}">
      <div class="pmeta">${esc(fmtDate(p.published_at || p.created_at))}</div>
      <h2>${esc(p.title)}</h2>
      ${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}
      <span class="pgo">Read it &rarr;</span>
    </a>`).join('')
      : `<div class="empty"><p>First one&rsquo;s coming.</p></div>`;

    const html = shell({
      title: 'The Aari Blog · Contracts, compliance, and the stuff nobody teaches you',
      desc: 'Compliance, contracts, forms, and the Florida law changes that actually hit your deals. Written by a Southwest Florida broker who reads every file.',
      canonical: `${SITE}/blog`,
      ogImage: `${SITE}/images/og-cover.jpg`,
      jsonLd: {
        '@context': 'https://schema.org', '@type': 'Blog',
        name: 'The Aari Blog', url: `${SITE}/blog`,
        publisher: { '@type': 'Organization', name: 'Aari Realty LLC' },
      },
      body: `<div class="bhead">
  <span class="beb">The Aari Blog</span>
  <h1>The stuff nobody <em>teaches you.</em></h1>
  <p>Contracts. Compliance. Forms. The Florida law changes that actually hit your deals, and the near misses I catch on real files.</p>
</div>
<div class="plist">${list}</div>`,
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=600');
    res.status(200).send(html);
  } catch (err) {
    console.error('[blog]', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(notFound('Something broke on our end.'));
  }
};

function notFound(msg) {
  return shell({
    title: 'Not found · Aari Realty',
    desc: 'That post is not here.',
    canonical: `${SITE}/blog`,
    ogImage: null, jsonLd: null,
    body: `<div class="bhead">
  <span class="beb">404</span>
  <h1>That one <em>doesn&rsquo;t exist.</em></h1>
  <p>${esc(msg || 'Wrong link, or it was never published. Either way, the rest are worth your time.')}</p>
</div>
<div class="plist" style="text-align:center;padding-top:30px"><a class="pgo" href="/blog">See every post &rarr;</a></div>`,
  });
}
