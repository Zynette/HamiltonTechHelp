import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { themeForDate, torontoDate, easterDay, loadPreferences } from '../public/theme.js';
import { createWeatherService, weatherKind } from '../src/weather.js';
import { pages, pageMetadata } from '../src/site.js';
import { clinicTopics } from '../public/clinic.js';
import { categories } from '../src/validation.js';

test('Toronto boundaries and seasonal/holiday schedules', () => {
  for (const [day, expected] of Object.entries({
    '2026-01-05': 'new-year',
    '2026-01-06': 'winter',
    '2026-02-07': 'valentine',
    '2026-02-15': 'winter',
    '2026-03-01': 'spring',
    '2026-04-03': 'easter',
    '2026-04-06': 'easter',
    '2026-04-07': 'spring',
    '2026-06-01': 'summer',
    '2026-06-25': 'canada-day',
    '2026-07-01': 'canada-day',
    '2026-07-02': 'summer',
    '2026-09-01': 'autumn',
    '2026-10-09': 'thanksgiving',
    '2026-10-12': 'thanksgiving',
    '2026-10-13': 'autumn',
    '2026-10-15': 'halloween',
    '2026-11-01': 'autumn',
    '2026-11-25': 'christmas',
    '2026-12-26': 'christmas',
    '2026-12-27': 'new-year',
  }))
    assert.equal(themeForDate(new Date(day + 'T17:00:00Z')).theme, expected, day);
  assert.equal(torontoDate(new Date('2026-03-01T03:00:00Z')), '2026-02-28');
  assert.equal(new Date(easterDay(2027)).toISOString().slice(0, 10), '2027-03-28');
  assert.equal(themeForDate(new Date('2027-10-11T17:00:00Z')).theme, 'thanksgiving');
});
test('blocked and malformed preference storage fail safely', () => {
  for (const val of ['null', '[]', '"string"', '9', '{broken'])
    assert.deepEqual(loadPreferences({ getItem: () => val }), {});
  assert.deepEqual(
    loadPreferences({
      getItem: () => {
        throw Error('blocked');
      },
    }),
    {},
  );
});
const now = Date.parse('2026-11-24T17:00:00Z');
const fixture = (timestamp = new Date(now).toISOString()) => ({
  properties: {
    name: { en: 'Hamilton' },
    currentConditions: {
      timestamp: { en: timestamp },
      condition: { en: 'Light snow' },
      temperature: { value: { en: 1 } },
    },
  },
});
test('weather coalesces requests, caches for 15 minutes and refreshes', async () => {
  let calls = 0,
    time = now;
  const get = createWeatherService(
    async () => {
      calls++;
      return Response.json(fixture());
    },
    () => time,
  );
  const data = await Promise.all([get(), get(), get()]);
  assert.equal(calls, 1);
  assert.equal(data[0].kind, 'snow');
  await get();
  assert.equal(calls, 1);
  time += 16 * 60000;
  await get();
  assert.equal(calls, 2);
});
test('weather rejects stale/invalid/missing data and backs off failures', async () => {
  for (const data of [fixture('invalid'), fixture('2020-01-01T00:00:00Z'), {}]) {
    let calls = 0;
    const get = createWeatherService(
      async () => {
        calls++;
        return Response.json(data);
      },
      () => now,
    );
    assert.equal(await get(), null);
    assert.equal(await get(), null);
    assert.equal(calls, 1);
  }
  const get = createWeatherService(
    async () => {
      throw Error('offline');
    },
    () => now,
  );
  assert.equal(await get(), null);
  assert.equal(weatherKind('Clear', 22), 'night');
  assert.equal(weatherKind('Rain', 12), 'rain');
  assert.equal(weatherKind('Mostly Cloudy', 12), 'cloudy');
});
test('all bilingual routes, assets, fragments and PDF downloads resolve in source', async () => {
  const routeMap = new Map(pages.map((p) => [p.path, p.file]));
  assert.equal(pages.length, 28);
  for (const p of pages) {
    const html = await readFile('public/' + p.file, 'utf8');
    assert.match(html, /<h1>/);
    assert.match(html, /<html lang="(en-CA|fil)"/);
    for (const [, link] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
      const [path, hash] = link.split('#');
      if (routeMap.has(path)) {
        if (hash) {
          const target = await readFile('public/' + routeMap.get(path), 'utf8');
          assert.ok(
            target.includes(`id="${hash}"`) ||
              ['privacy', 'terms', 'website-quote', 'remote-help'].includes(hash),
            link,
          );
        }
      } else {
        await readFile('public' + path);
      }
    }
    assert.ok(pageMetadata('https://onlinetechnicalhelp.com', p.path).includes('hreflang="fil"'));
  }
  const pdfs = await readdir('public/guides');
  assert.equal(pdfs.length, 20);
  for (const file of pdfs) {
    const data = await readFile('public/guides/' + file);
    assert.equal(data.subarray(0, 5).toString(), '%PDF-');
  }
  assert.equal(clinicTopics.length, 10);
  for (const t of clinicTopics) assert.ok(categories.includes(t[3]));
});
