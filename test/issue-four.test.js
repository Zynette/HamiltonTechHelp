import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import worker from '../src/cloudflare-worker.js';
import { createApp } from '../src/server.js';
import { pages } from '../src/site.js';
import { validateRequest } from '../src/validation.js';

const origin = 'https://onlinetechnicalhelp.com';
const env = { SITE_URL: origin, FORMSPREE_FORM_ID: 'test1234' };
const inquiry = {
  kind: 'inquiry',
  name: 'Example Customer',
  email: 'example@example.com',
  category: 'Outlook/email',
  device: 'Apple Mac',
  description: 'My Outlook email keeps asking me to sign in.',
  website: '',
};
const booking = {
  ...inquiry,
  kind: 'booking',
  method: 'Remote',
  date: '2099-01-01',
  window: 'Flexible',
  phone: '',
  consent: true,
};
const project = {
  kind: 'project',
  name: 'Example Customer',
  email: 'example@example.com',
  projectType: 'Booking or inquiry form setup',
  siteUrl: '',
  timeframe: '',
  budget: 'Not sure yet',
  description: 'I need help setting up my business inquiry workflow.',
  website: '',
};

function post(data, ip) {
  return new Request(`${origin}/api/requests`, {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      'CF-Connecting-IP': ip,
    },
    body: JSON.stringify(data),
  });
}

test('www and insecure apex get permanent secure redirects, while POST is not redirected', async () => {
  for (const [from, expected] of [
    [`https://www.onlinetechnicalhelp.com/website-design?a=b`, `${origin}/website-design?a=b`],
    [`http://onlinetechnicalhelp.com/contact?x=2`, `${origin}/contact?x=2`],
  ]) {
    for (const method of ['GET', 'HEAD']) {
      const response = await worker.fetch(new Request(from, { method }), env);
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('location'), expected);
      assert.match(response.headers.get('content-security-policy'), /frame-ancestors/);
    }
  }
  const rejected = await worker.fetch(
    new Request('https://www.onlinetechnicalhelp.com/api/requests', {
      method: 'POST',
      headers: { Origin: 'https://www.onlinetechnicalhelp.com' },
      body: '{}',
    }),
    env,
  );
  assert.equal(rejected.status, 403);
});

test('published pages are in sitemap and service pages carry canonical tags', async () => {
  const assets = {
    fetch: async () =>
      new Response('<!doctype html><title>Test</title><!-- SITE_METADATA -->', {
        headers: { 'Content-Type': 'text/html' },
      }),
  };
  const serviceEnv = { ...env, ASSETS: assets };
  const xml = await (await worker.fetch(new Request(`${origin}/sitemap.xml`), serviceEnv)).text();
  for (const page of pages) {
    const response = await worker.fetch(new Request(`${origin}${page.path}`), serviceEnv);
    assert.equal(response.status, 200, page.path);
    assert.match(await response.text(), new RegExp(`rel="canonical" href="${origin}${page.path}"`));
    assert.ok(xml.includes(`<loc>${origin}${page.path}</loc>`));
  }
  const preview = await worker.fetch(
    new Request('https://online-technical-help.example.workers.dev/about'),
    serviceEnv,
  );
  assert.equal(preview.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('all three Cloudflare form paths accept 2xx, and reject provider failures', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  });
  console.warn = () => {};
  let outcome = 'ok';
  const submitted = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://formspree.io/f/test1234');
    assert.equal(init.redirect, 'manual');
    assert.equal(init.headers.Referer, `${origin}/`);
    submitted.push(JSON.parse(init.body));
    if (outcome === 'network') throw new Error('Simulated connection loss');
    if (outcome === 'reject') return new Response('No', { status: 422 });
    return new Response(null, { status: 204 });
  };
  let index = 0;
  for (const body of [inquiry, booking, project]) {
    const response = await worker.fetch(post(body, `198.51.100.${40 + index++}`), env);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  }
  assert.deepEqual(
    submitted.map((item) => item.kind),
    ['inquiry', 'booking', 'project'],
  );
  assert.equal(submitted[2].budget, 'Not sure yet');
  for (const kind of [inquiry, booking, project]) {
    outcome = 'reject';
    const rejected = await worker.fetch(post(kind, `198.51.100.${40 + index++}`), env);
    assert.equal(rejected.status, 502);
    assert.equal((await rejected.json()).ok, undefined);
    outcome = 'network';
    const unknown = await worker.fetch(post(kind, `198.51.100.${40 + index++}`), env);
    assert.equal(unknown.status, 502);
    assert.match((await unknown.json()).message, /could not be verified/i);
  }
});

test('new business scope and budget values match server-side validation', () => {
  for (const projectType of [
    'Business email or Microsoft 365 setup',
    'Booking or inquiry form setup',
    'Website care or ongoing updates',
  ]) {
    const result = validateRequest({ ...project, projectType }, new Date('2026-11-20'));
    assert.deepEqual(result.errors, {});
  }
  assert.ok(
    Object.keys(validateRequest({ ...project, budget: 'made-up' }, new Date('2026-11-20')).errors)
      .length > 0,
  );
});

test('Node publishes the new pages and follows the same 2xx provider acceptance rule', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  let calls = 0;
  globalThis.fetch = (url, init) => {
    if (String(url).startsWith('https://formspree.io/')) {
      calls += 1;
      assert.equal(init.redirect, 'manual');
      assert.equal(init.headers.Referer, `${origin}/`);
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return originalFetch(url, init);
  };
  const app = createApp({ siteUrl: origin, formId: 'test1234', production: true });
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  t.after(
    () =>
      new Promise((resolve) => {
        app.close(resolve);
        app.closeAllConnections();
      }),
  );
  const base = `http://localhost:${app.address().port}`;
  for (const page of pages) {
    const response = await originalFetch(base + page.path);
    assert.equal(response.status, 200, page.path);
    assert.match(await response.text(), /rel="canonical"/);
  }
  const response = await originalFetch(base + '/api/requests', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  assert.equal(response.status, 200);
  assert.equal(calls, 1);
});
