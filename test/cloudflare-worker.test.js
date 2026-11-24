import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/cloudflare-worker.js';

const env = {
  SITE_URL: 'https://onlinetechnicalhelp.com',
  FORMSPREE_FORM_ID: 'test1234',
};

const body = {
  kind: 'inquiry',
  name: 'Test Customer',
  email: 'test@example.com',
  device: 'Windows laptop',
  category: 'General computer problem',
  description: 'Testing Formspree delivery from the Cloudflare Worker.',
  website: '',
};

function request(ip) {
  return new Request('https://onlinetechnicalhelp.com/api/requests', {
    method: 'POST',
    headers: {
      Origin: 'https://onlinetechnicalhelp.com',
      'Content-Type': 'application/json',
      'CF-Connecting-IP': ip,
    },
    body: JSON.stringify(body),
  });
}

test('Cloudflare Worker accepts successful Formspree response without requiring JSON body', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://formspree.io/f/test1234');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(options.headers.Referer, 'https://onlinetechnicalhelp.com/');
    assert.equal(options.redirect, 'manual');
    return new Response(null, { status: 204 });
  };

  const result = await worker.fetch(request('203.0.113.10'), env);
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { ok: true });
});

test('Cloudflare Worker rejects Formspree HTTP errors', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  });

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: 'validation failed' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  console.warn = () => {};

  const result = await worker.fetch(request('203.0.113.11'), env);
  assert.equal(result.status, 502);
  assert.match((await result.json()).message, /couldn.t accept/i);
});

test('Cloudflare Worker does not claim success when Formspree cannot be reached', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    throw new Error('network failure');
  };

  const result = await worker.fetch(request('203.0.113.12'), env);
  assert.equal(result.status, 502);
  assert.match((await result.json()).message, /could not be verified/i);
});

test('Cloudflare Worker does not treat a Formspree redirect as successful delivery', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  });

  globalThis.fetch = async () =>
    new Response(null, {
      status: 302,
      headers: { Location: 'https://formspree.io/thanks' },
    });
  console.warn = () => {};

  const result = await worker.fetch(request('203.0.113.13'), env);
  assert.equal(result.status, 502);
  assert.match((await result.json()).message, /couldn.t accept/i);
});

test('Worker stops oversized chunked bodies before buffering the entire stream', async () => {
  let cancelled = false;
  let pulls = 0;
  const stream = new ReadableStream({
    pull(controller) {
      pulls += 1;
      controller.enqueue(new Uint8Array(6000));
    },
    cancel() {
      cancelled = true;
    },
  });
  const result = await worker.fetch(
    new Request(`${env.SITE_URL}/api/requests`, {
      method: 'POST',
      headers: {
        Origin: env.SITE_URL,
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.80',
      },
      body: stream,
      duplex: 'half',
    }),
    env,
  );
  assert.equal(result.status, 413);
  assert.equal(cancelled, true);
  assert.ok(pulls <= 3, `Only bounded chunks should be read, got ${pulls}`);
});

test('Worker handles interrupted request streams without an uncaught exception', async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.error(new Error('interrupted'));
    },
  });
  const result = await worker.fetch(
    new Request(`${env.SITE_URL}/api/requests`, {
      method: 'POST',
      headers: {
        Origin: env.SITE_URL,
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.81',
      },
      body: stream,
      duplex: 'half',
    }),
    env,
  );
  assert.equal(result.status, 400);
});

test('injected HTML cannot reuse asset validators, byte lengths or range responses', async () => {
  const result = await worker.fetch(
    new Request(`${env.SITE_URL}/website-design`, {
      headers: {
        'If-None-Match': 'old-asset',
        'If-Modified-Since': 'yesterday',
        Range: 'bytes=0-10',
        'If-Range': 'old-asset',
      },
    }),
    {
      ...env,
      ASSETS: {
        fetch: async (request) => {
          for (const name of ['If-None-Match', 'If-Modified-Since', 'Range', 'If-Range'])
            assert.equal(request.headers.get(name), null);
          return new Response('<html><!-- SITE_METADATA --></html>', {
            headers: {
              ETag: 'source-asset',
              'Content-Length': '34',
              'Last-Modified': 'yesterday',
              'Accept-Ranges': 'bytes',
            },
          });
        },
      },
    },
  );
  assert.equal(result.status, 200);
  for (const name of [
    'ETag',
    'Content-Length',
    'Content-Encoding',
    'Last-Modified',
    'Accept-Ranges',
  ])
    assert.equal(result.headers.get(name), null);
  assert.match(await result.text(), /rel="canonical"/);
});
