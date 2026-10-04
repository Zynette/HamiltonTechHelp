import { validateRequest } from './validation.js';

const maxBodyBytes = 10000;
const rateLimitWindowMs = 15 * 60 * 1000;
const maxTrackedClients = 10000;
const defaultLimit = 5;
const attempts = new Map();

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000',
};

function getOrigin(siteUrl) {
  try {
    return new URL(siteUrl).origin;
  } catch {
    return '';
  }
}

function response(body, status = 200, type = 'application/json; charset=utf-8', extra = {}) {
  const headers = new Headers({
    ...securityHeaders,
    'Content-Type': type,
    'Cache-Control': 'no-store',
    ...extra,
  });
  return new Response(
    typeof body === 'object' && body !== null ? JSON.stringify(body) : body,
    { status, headers },
  );
}

function metadata(origin) {
  return `<link rel="canonical" href="${origin}/"><meta property="og:url" content="${origin}/"><script type="application/ld+json">${JSON.stringify(
    {
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
          serviceType: 'Remote Windows, Apple, email and printer connection support',
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
    },
  ).replace(/</gu, '\\u003c')}</script>`;
}

function clientKey(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

function checkRateLimit(request, now, limit = defaultLimit) {
  for (const [key, value] of attempts) {
    if (value.until <= now) attempts.delete(key);
  }

  const key = clientKey(request);
  const existing = attempts.get(key);

  if (!existing && attempts.size >= maxTrackedClients) return false;

  const entry = existing || { count: 0, until: now + rateLimitWindowMs };
  if (entry.count >= limit) return false;

  entry.count += 1;
  attempts.set(key, entry);
  return true;
}

async function deliver(formId, data) {
  const result = await fetch(`https://formspree.io/f/${formId}`, {
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

  if (!result.ok) return false;
  const payload = await result.json();
  return payload.ok === true;
}

async function handleRequestForm(request, env) {
  if (request.method !== 'POST') {
    return response({ message: 'Use POST for this form.' }, 405, undefined, { Allow: 'POST' });
  }

  const origin = getOrigin(env.SITE_URL);
  if (
    !origin ||
    request.headers.get('Origin') !== origin ||
    request.headers.get('Sec-Fetch-Site') === 'cross-site'
  ) {
    return response({ message: 'Please send your request from this website.' }, 403);
  }

  const contentType = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return response({ message: 'Please submit the form as JSON.' }, 415);
  }

  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    return response({ message: 'This request is too large.' }, 413);
  }

  const now = Date.now();
  if (!checkRateLimit(request, now)) {
    return response(
      { message: 'There have been several requests. Please wait 15 minutes before trying again.' },
      429,
      undefined,
      { 'Retry-After': '900' },
    );
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBodyBytes) {
    return response({ message: 'This request is too large.' }, 413);
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return response({ message: 'The form could not be read. Please try again.' }, 400);
  }

  const { errors, data } = validateRequest(body, new Date(now));
  if (Object.keys(errors).length) {
    return response({ message: 'Please check the highlighted fields.', errors }, 422);
  }

  const formId = env.FORMSPREE_FORM_ID || '';
  if (!/^[a-zA-Z0-9]{4,40}$/u.test(formId)) {
    return response(
      {
        message:
          'Online requests aren’t open yet. Nothing has been sent. Please email techspecialistsupport@gmail.com for now.',
      },
      503,
    );
  }

  try {
    if (!(await deliver(formId, data))) {
      return response(
        {
          message:
            'The delivery service couldn’t accept your message. Your details are still here; please try again later.',
        },
        502,
      );
    }
  } catch {
    return response(
      {
        message:
          'Delivery could not be verified. Please wait before trying again to avoid sending a duplicate request.',
      },
      502,
    );
  }

  return response({ ok: true });
}

async function handleHome(request, env) {
  const origin = getOrigin(env.SITE_URL);
  if (!origin) return response('Site configuration is incomplete.', 503, 'text/plain; charset=utf-8');

  const assetRequest = new Request(new URL('/', request.url), {
    method: 'GET',
    headers: request.headers,
  });
  const asset = await env.ASSETS.fetch(assetRequest);
  if (!asset.ok) return asset;

  const html = (await asset.text()).replace('<!-- SITE_METADATA -->', metadata(origin));
  const headers = new Headers(asset.headers);
  for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-cache');

  if (new URL(request.url).hostname.endsWith('.workers.dev')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return new Response(request.method === 'HEAD' ? null : html, {
    status: asset.status,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/requests') return handleRequestForm(request, env);

    if (url.pathname === '/healthz') {
      if (!['GET', 'HEAD'].includes(request.method)) {
        return response('Method not allowed', 405, 'text/plain; charset=utf-8', {
          Allow: 'GET, HEAD',
        });
      }
      return response(
        request.method === 'HEAD' ? '' : { status: 'ok' },
        200,
        'application/json; charset=utf-8',
      );
    }

    if (url.pathname === '/robots.txt') {
      if (!['GET', 'HEAD'].includes(request.method)) {
        return response('Method not allowed', 405, 'text/plain; charset=utf-8', {
          Allow: 'GET, HEAD',
        });
      }
      const origin = getOrigin(env.SITE_URL);
      const isPreview = url.hostname.endsWith('.workers.dev');
      const body =
        isPreview || !origin
          ? 'User-agent: *\nDisallow: /\n'
          : `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
      return response(request.method === 'HEAD' ? '' : body, 200, 'text/plain; charset=utf-8');
    }

    if (url.pathname === '/sitemap.xml') {
      if (!['GET', 'HEAD'].includes(request.method)) {
        return response('Method not allowed', 405, 'text/plain; charset=utf-8', {
          Allow: 'GET, HEAD',
        });
      }
      const origin = getOrigin(env.SITE_URL);
      if (!origin || url.hostname.endsWith('.workers.dev')) {
        return response('Not found', 404, 'text/plain; charset=utf-8');
      }
      const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`;
      return response(
        request.method === 'HEAD' ? '' : body,
        200,
        'application/xml; charset=utf-8',
      );
    }

    if (url.pathname === '/' && ['GET', 'HEAD'].includes(request.method)) {
      return handleHome(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
