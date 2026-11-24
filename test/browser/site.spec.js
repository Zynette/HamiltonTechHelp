import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pages } from '../../src/site.js';
import { themes } from '../../public/theme.js';
test.beforeEach(async ({ page }) => {
  await page.route('**/api/weather', (r) => r.fulfill({ json: { weather: null } }));
});
for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920])
  test(`layout and accessibility at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('A little clarity.');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    await page.locator('[data-dialog=booking-dialog]').click();
    await expect(page.locator('#booking-dialog')).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    await page.keyboard.press('Escape');
    await page.locator('.hero .text-link').click();
    await expect(page.locator('#project-dialog')).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    await page.keyboard.press('Escape');
    if ([390, 1440].includes(width))
      await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
for (const kind of ['inquiry', 'booking', 'project'])
  test(`${kind} validation, failure preservation and acceptance`, async ({ page }) => {
    await page.goto('/');
    if (kind === 'booking') await page.locator('[data-dialog=booking-dialog]').click();
    if (kind === 'project') await page.locator('.hero .text-link').click();
    const f = page.locator(`#${kind}-form`);
    await f.locator('[type=submit]').click();
    await expect(f.locator('[name=name]')).toHaveAttribute('aria-invalid', 'true');
    await f.locator('[name=name]').fill('Test Customer');
    await f.locator('[name=email]').fill('failure@example.com');
    await f.locator('[name=description]').fill('Please review my computer or website setup.');
    if (kind === 'project') await f.locator('[name=projectType]').selectOption('Website redesign');
    else await f.locator('[name=device]').selectOption('Windows laptop');
    if (kind === 'booking') {
      await f.locator('[name=date]').fill('2099-01-01');
      await f.locator('[name=window]').fill('Afternoon');
      await f.locator('[name=consent]').check();
    }
    await f.locator('[type=submit]').click();
    await expect(f.locator('.form-status')).toHaveAttribute('data-state', 'error');
    await expect(f.locator('[name=description]')).not.toHaveValue('');
    await f.locator('[name=email]').fill('example@example.com');
    await f.locator('[type=submit]').click();
    await expect(f.locator('.form-status')).toHaveAttribute('data-state', 'success');
    await expect(f.locator('[name=description]')).toHaveValue('');
  });
test('clinic carries editable context and stops inappropriate remote requests', async ({
  page,
}) => {
  await page.goto('/clinic');
  await page.locator('#clinic-topic').selectOption('sync');
  await page.locator('#clinic-device').selectOption('Apple Mac');
  await page.locator('#clinic-show').click();
  await expect(page.locator('#clinic-advice')).toContainText('OneDrive');
  await page.locator('#clinic-help').click();
  await expect(page.locator('#inquiry-description')).toContainText('Tech Clinic');
  await expect(page.locator('#inquiry-device')).toHaveValue('Apple Mac');
  await page.goto('/clinic');
  await page.locator('#clinic-danger').check();
  await page.locator('#clinic-show').click();
  await expect(page.locator('#clinic-help')).toBeDisabled();
});
test('slider works from keyboard and pointer', async ({ page }) => {
  await page.goto('/portfolio');
  const s = page.locator('#compare');
  await s.focus();
  await page.keyboard.press('End');
  await expect(s).toHaveValue('100');
  await page.keyboard.press('Home');
  await expect(s).toHaveValue('0');
  const b = await s.boundingBox();
  await page.mouse.click(b.x + b.width * 0.75, b.y + b.height / 2);
  expect(Number(await s.inputValue())).toBeGreaterThan(50);
});
test('slider accepts touch', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.route('**/api/weather', (r) => r.fulfill({ json: { weather: null } }));
  await page.goto('http://localhost:3101/portfolio');
  await page.locator('#compare').scrollIntoViewIfNeeded();
  const b = await page.locator('#compare').boundingBox();
  await page.touchscreen.tap(b.x + b.width * 0.8, b.y + b.height / 2);
  expect(Number(await page.locator('#compare').inputValue())).toBeGreaterThan(50);
  await context.close();
});
test('all seasons and holidays in light and dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.locator('.preferences summary').click();
  await page.locator('#calm').check();
  for (const theme of themes.filter((x) => x !== 'auto'))
    for (const appearance of ['light', 'dark']) {
      await page.locator('#theme-choice').selectOption(theme);
      await page.locator('#appearance').selectOption(appearance);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect(
        (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
          .violations,
      ).toEqual([]);
      await page.screenshot({ path: `test-results/${theme}-${appearance}.png` });
    }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-calm', 'true');
});
test('reduced motion, large text and weather failure preserve content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-calm', 'true');
  await page.locator('.preferences summary').click();
  await page.locator('#large-text').check();
  await expect(page.locator('html')).toHaveClass('large-text');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await expect(page.locator('#weather')).toContainText('Hamilton');
});
test('all pages render with a language counterpart and working downloads', async ({
  page,
  request,
}) => {
  for (const p of pages) {
    await page.goto(p.path);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.locator('.language').getAttribute('href')).toBeTruthy();
    expect(
      await page.evaluate(() =>
        [...document.images].every((i) => i.complete && i.naturalWidth > 0),
      ),
    ).toBe(true);
  }
  await page.goto('/fil');
  await page.locator('#inquiry-form [type=submit]').click();
  await expect(page.locator('#inquiry-name-error')).toContainText('Pakisagutan');
  for (const lang of ['en', 'fil']) {
    await page.goto(lang === 'fil' ? '/fil/resources' : '/resources');
    const links = await page
      .locator('a[download]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(links).toHaveLength(10);
    for (const url of links) {
      const r = await request.get(url);
      expect(r.ok()).toBe(true);
      expect((await r.body()).subarray(0, 5).toString()).toBe('%PDF-');
    }
  }
});
test('corrupted or unavailable browser storage cannot break forms', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw Error('blocked');
      },
    });
  });
  await page.goto('/');
  await expect(page.locator('#inquiry-form [type=submit]')).toBeEnabled();
  await page.locator('.hero .text-link').click();
  await expect(page.locator('#project-dialog')).toBeVisible();
});
