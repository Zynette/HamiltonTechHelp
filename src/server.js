import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRequest } from './validation.js';
import { releaseIssues } from '../scripts/check-release.js';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
};
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};
export function createApp({
  formId = process.env.FORMSPREE_FORM_ID || '',
  siteUrl = process.env.SITE_URL || '',
  production = process.env.NODE_ENV === 'production',
  deliver,
  clock = () => Date.now(),
  limit = 5,
} = {}) {
  const origin = siteUrl ? new URL(siteUrl).origin : '';
  const attempts = new Map();
  const delivery =
    deliver ??
    (async (data) => {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          _subject:
            data.kind === 'booking'
              ? 'Remote tech-support appointment request — Online Technical Help'
              : data.kind === 'project'
                ? 'Website project inquiry — Online Technical Help'
                : 'New remote tech-help inquiry — Online Technical Help',
          timezone: 'America/Toronto',
        }),
        signal: AbortSignal.timeout(12000),
        redirect: 'error',
      });
      if (!response.ok) return false;
      const result = await response.json();
      return result.ok === true;
    });
  function send(res, code, body, type = 'application/json; charset=utf-8', extra = {}) {
    res.writeHead(code, {
      ...securityHeaders,
      ...(production
        ? { 'Strict-Transport-Security': 'max-age=31536000' }
        : { 'X-Robots-Tag': 'noindex, nofollow' }),
      'Content-Type': type,
      'Cache-Control': 'no-store',
      ...extra,
    });
    res.end(typeof body === 'object' && !Buffer.isBuffer(body) ? JSON.stringify(body) : body);
  }
  return createServer(
    { maxHeaderSize: 8192, requestTimeout: 20000, headersTimeout: 15000 },
    async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/api/requests') {
          if (req.method !== 'POST')
            return send(res, 405, { message: 'Use POST for this form.' }, undefined, {
              Allow: 'POST',
            });
          // Never trust forwarded IP or Host headers for authorization.
          const expectedOrigin =
            origin || (production ? '' : `http://localhost:${req.socket.localPort}`);
          if (
            !expectedOrigin ||
            req.headers.origin !== expectedOrigin ||
            req.headers['sec-fetch-site'] === 'cross-site'
          )
            return send(res, 403, { message: 'Please send your request from this website.' });
          const now = clock();
          for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
          const ip = req.socket.remoteAddress || 'unknown';
          const entry = attempts.get(ip) || { count: 0, until: now + 15 * 60 * 1000 };
          if (entry.count >= limit || (!attempts.has(ip) && attempts.size >= 10000))
            return send(
              res,
              429,
              {
                message:
                  'There have been several requests. Please wait 15 minutes before trying again.',
              },
              undefined,
              { 'Retry-After': '900' },
            );
          entry.count += 1;
          attempts.set(ip, entry);
          if (
            !(req.headers['content-type'] || '')
              .split(';')[0]
              .trim()
              .toLowerCase()
              .match(/^application\/json$/u)
          )
            return send(res, 415, { message: 'Please submit the form as JSON.' });
          if (Number(req.headers['content-length']) > 10000)
            return send(res, 413, { message: 'This request is too large.' });
          const chunks = [];
          let bytes = 0;
          for await (const chunk of req) {
            bytes += chunk.length;
            if (bytes > 10000) {
              send(res, 413, { message: 'This request is too large.' });
              return;
            }
            chunks.push(chunk);
          }
          let body;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          } catch {
            return send(res, 400, { message: 'The form could not be read. Please try again.' });
          }
          const { errors, data } = validateRequest(body, new Date(now));
          if (Object.keys(errors).length)
            return send(res, 422, { message: 'Please check the highlighted fields.', errors });
          if (!/^[a-zA-Z0-9]{4,40}$/u.test(formId))
            return send(res, 503, {
              message:
                'Online requests aren’t open yet. Nothing has been sent. Please try again once the service launches.',
            });
          try {
            if (!(await delivery(data)))
              return send(res, 502, {
                message:
                  'The delivery service couldn’t accept your message. Your details are still here; please try again later.',
              });
          } catch {
            return send(res, 502, {
              message:
                'Delivery could not be verified. Please wait before trying again to avoid sending a duplicate request.',
            });
          }
          return send(res, 200, { ok: true });
        }
        if (!['GET', 'HEAD'].includes(req.method))
          return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8', {
            Allow: 'GET, HEAD',
          });
        if (url.pathname === '/healthz')
          return send(res, 200, req.method === 'HEAD' ? '' : { status: 'ok' });
        if (url.pathname === '/robots.txt')
          return send(
            res,
            200,
            req.method === 'HEAD'
              ? ''
              : production && origin
                ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
                : 'User-agent: *\nDisallow: /\n',
            'text/plain; charset=utf-8',
          );
        if (url.pathname === '/sitemap.xml') {
          if (!production || !origin)
            return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
          return send(
            res,
            200,
            req.method === 'HEAD'
              ? ''
              : `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`,
            'application/xml; charset=utf-8',
          );
        }
        const path = decodeURIComponent(url.pathname);
        // Serve only an explicit public asset set; source files and env files stay private.
        if (!(
          path === '/' ||
          ['/styles.css', '/app.js', '/favicon.svg'].includes(path) ||
          /^\/fonts\/(ibm-plex-sans-latin-(400|500|600)-normal\.woff2|OFL\.txt)$/u.test(path)
        ))
          return send(res, 404, 'Page not found', 'text/plain; charset=utf-8');
        let file = await readFile(resolve(publicDir, path === '/' ? 'index.html' : path.slice(1)));
        if (path === '/') {
          const metadata = origin
            ? `<link rel="canonical" href="${origin}/"><meta property="og:url" content="${origin}/">${
                production
                  ? `<script type="application/ld+json">${JSON.stringify({
                      '@context': 'https://schema.org',
                      '@graph': [
                        {
                          '@type': 'Organization',
                          '@id': `${origin}/#organization`,
                          name: 'Online Technical Help',
                          url: `${origin}/`,
                          email: 'mailto:techspecialistsupport@gmail.com',
                          description:
                            'Based in Hamilton, Ontario. Remote-only Windows, Mac, email, software, printer connection and everyday Apple-device help by appointment, plus website design and support quoted individually.',
                        },
                        {
                          '@type': 'Service',
                          '@id': `${origin}/#remote-support`,
                          name: 'Remote tech support',
                          serviceType:
                            'Remote Windows, Apple, email and printer connection support',
                          provider: { '@id': `${origin}/#organization` },
                          url: `${origin}/#services`,
                        },
                        {
                          '@type': 'Service',
                          '@id': `${origin}/#website-services`,
                          name: 'Website design and support',
                          serviceType:
                            'Business websites, redesigns, landing pages, integrations and website updates',
                          provider: { '@id': `${origin}/#organization` },
                          url: `${origin}/#websites`,
                        },
                        {
                          '@type': 'WebSite',
                          '@id': `${origin}/#website`,
                          url: `${origin}/`,
                          name: 'Online Technical Help',
                          inLanguage: 'en-CA',
                          publisher: { '@id': `${origin}/#organization` },
                        },
                      ],
                    }).replace(/</gu, '\\u003c')}</script>`
                  : ''
              }`
            : '';
          file = Buffer.from(file.toString().replace('<!-- SITE_METADATA -->', metadata));
        }
        send(
          res,
          200,
          req.method === 'HEAD' ? '' : file,
          mimeTypes[extname(path === '/' ? 'index.html' : path)],
          { 'Cache-Control': path === '/' ? 'no-cache' : 'public, max-age=3600' },
        );
      } catch {
        if (!res.headersSent) send(res, 400, { message: 'The request could not be processed.' });
        else res.end();
      }
    },
  );
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.NODE_ENV === 'production') {
    const issues = await releaseIssues();
    if (issues.length) {
      console.error('Launch checks failed:\n' + issues.map((issue) => `- ${issue}`).join('\n'));
      process.exit(1);
    }
  }
  const port = Number(process.env.PORT || 3000);
  const server = createApp();
  server.listen(port, process.env.HOST || '0.0.0.0', () =>
    console.log(`Online Technical Help running on port ${port}`),
  );
  const stop = () => server.close(() => process.exit(0));
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
