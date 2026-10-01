import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/server.js';
import { validateRequest } from '../src/validation.js';

const base = {
  kind: 'inquiry',
  name: 'Test Customer',
  email: 'test@example.com',
  device: 'Windows laptop',
  category: 'General computer problem',
  description: 'My printer stopped responding today.',
  website: '',
};
const booking = {
  ...base,
  kind: 'booking',
  method: 'Remote',
  date: '2026-10-02',
  window: 'Flexible',
  phone: '',
  consent: true,
};
const now = new Date('2026-10-01T16:00:00Z');
async function setup(t, options = {}) {
  const server = createApp({ clock: () => now.getTime(), ...options });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const url = `http://localhost:${server.address().port}`;
  return {
    url,
    post: (body, headers = {}) =>
      fetch(`${url}/api/requests`, {
        method: 'POST',
        headers: { Origin: url, 'Content-Type': 'application/json', ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      }),
  };
}
test('validates inquiry and booking without retaining unknown fields', () => {
  const result = validateRequest({ ...booking, secret: 'ignored' }, now);
  assert.deepEqual(result.errors, {});
  assert.equal(result.data.secret, undefined);
  assert.equal(validateRequest(base, now).data.kind, 'inquiry');
});
test('rejects malformed input, missing consent, bad choices, invalid and past dates', () => {
  for (const body of [
    null,
    [],
    'x',
    { ...booking, consent: false },
    { ...booking, date: '2026-02-30' },
    { ...booking, date: '2026-09-30' },
    { ...base, device: 'macOS' },
    { ...base, name: [] },
    { ...base, email: 'invalid' },
    { ...base, description: 'x'.repeat(2001) },
  ])
    assert.ok(Object.keys(validateRequest(body, now).errors).length);
});
test('dates use Hamilton day at the UTC boundary', () => {
  assert.deepEqual(
    validateRequest({ ...booking, date: '2026-10-01' }, new Date('2026-10-02T01:00:00Z')).errors,
    {},
  );
});
test('unconfigured delivery fails explicitly; never claims receipt', async (t) => {
  const { post } = await setup(t);
  const response = await post(base);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, undefined);
});
test('provider acceptance yields success; accepted payload is validated and minimal', async (t) => {
  let delivered;
  const { post } = await setup(t, {
    formId: 'test1234',
    deliver: async (data) => {
      delivered = data;
      return true;
    },
  });
  assert.equal((await post({ ...booking, internal: 'drop' })).status, 200);
  assert.equal(delivered.kind, 'booking');
  assert.equal(delivered.internal, undefined);
  assert.equal(delivered.website, undefined);
});
test('provider rejection or timeout never yields success', async (t) => {
  for (const deliver of [
    async () => false,
    async () => {
      throw new Error('timeout');
    },
  ]) {
    const { post } = await setup(t, { formId: 'test1234', deliver });
    const response = await post(base);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, undefined);
  }
});
test('malformed body, spam trap and missing required fields do not reach delivery', async (t) => {
  let calls = 0;
  const { post } = await setup(t, {
    formId: 'test1234',
    deliver: async () => {
      calls++;
      return true;
    },
  });
  assert.equal((await post('{bad')).status, 400);
  assert.equal((await post({ ...base, website: 'spam.example' })).status, 422);
  assert.equal((await post({ ...base, email: '' })).status, 422);
  assert.equal((await post(base, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal(calls, 0);
});
test('cross-origin and forged host requests are rejected', async (t) => {
  const { post } = await setup(t);
  assert.equal(
    (await post(base, { Origin: 'https://evil.example', Host: 'evil.example' })).status,
    403,
  );
  assert.equal((await post(base, { Origin: 'null' })).status, 403);
});
test('rate limits repeated attempts and ignores spoofed forwarded IP', async (t) => {
  const { post } = await setup(t, { limit: 2 });
  await post(base);
  await post(base);
  const response = await post(base, { 'X-Forwarded-For': '8.8.8.8' });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '900');
});
test('rate limit expires after its window', async (t) => {
  let time = now.getTime();
  const { post } = await setup(t, { limit: 1, clock: () => time });
  await post(base);
  assert.equal((await post(base)).status, 429);
  time += 900001;
  assert.equal((await post(base)).status, 503);
});
test('large body is rejected and private paths are not served', async (t) => {
  const { url, post } = await setup(t);
  assert.equal((await post({ ...base, description: 'a'.repeat(11000) })).status, 413);
  for (const path of ['/.env', '/src/server.js', '/package.json', '/.git/config', '/%2e%2e%2f.env'])
    assert.equal((await fetch(url + path)).status, 404);
});
test('HTML, security headers and non-indexable development metadata', async (t) => {
  const { url } = await setup(t);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Everyday tech/);
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.match(await (await fetch(url + '/robots.txt')).text(), /Disallow: \//);
  assert.equal((await fetch(url + '/sitemap.xml')).status, 404);
});
test('production origin provides canonical and sitemap', async (t) => {
  const { url } = await setup(t, { production: true, siteUrl: 'https://tech.example' });
  const response = await fetch(url);
  const html = await response.text();
  assert.match(html, /rel="canonical" href="https:\/\/tech.example\/"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"Organization"/);
  assert.equal(response.headers.get('x-robots-tag'), null);
  assert.match(await (await fetch(url + '/sitemap.xml')).text(), /https:\/\/tech.example\//);
});
