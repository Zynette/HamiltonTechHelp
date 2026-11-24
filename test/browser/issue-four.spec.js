import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('business quote buttons preselect an allowed service and never book automatically', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#business-solutions [data-project-type]').click();
  await expect(page.locator('#project-dialog')).toBeVisible();
  await expect(page.locator('#project-form [name=projectType]')).toHaveValue(
    'Business email or Microsoft 365 setup',
  );
  await page.keyboard.press('Escape');
  await page.locator('.care-note [data-project-type]').click();
  await expect(page.locator('#project-form [name=projectType]')).toHaveValue(
    'Website care or ongoing updates',
  );
  await expect(page.locator('#project-form [name=budget]')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/#quote-booking-setup');
  await expect(page.locator('#project-dialog')).toBeVisible();
  await expect(page.locator('#project-form [name=projectType]')).toHaveValue(
    'Booking or inquiry form setup',
  );
});

test('distinct website and support links reach the correct request dialogs', async ({ page }) => {
  await page.goto('/website-design');
  await page.locator('.detail-actions a').first().click();
  await expect(page.locator('#project-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/remote-tech-support');
  await page.getByRole('link', { name: 'Request remote tech help', exact: true }).first().click();
  await expect(page.locator('#booking-dialog')).toBeVisible();
  await expect(page.locator('#booking-form [name=method]')).toHaveValue('Remote');
});

test('all published service pages fit phone/tablet/desktop layouts', async ({ page }) => {
  const paths = [
    '/remote-tech-support',
    '/website-design',
    '/website-maintenance',
    '/business-solutions',
    '/portfolio',
    '/about',
    '/contact',
  ];
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 840 });
    for (const path of paths) {
      const errors = [];
      const onError = (error) => errors.push(error.message);
      page.on('pageerror', onError);
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.detail-actions a').first()).toHaveAttribute('href', /\/#/);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${path} at ${width}px`,
      ).toBeLessThanOrEqual(width);
      expect(errors).toEqual([]);
      page.off('pageerror', onError);
      if (path === '/portfolio' && [390, 1440].includes(width)) {
        await page.screenshot({ path: `test-results/portfolio-${width}.png`, fullPage: true });
      }
    }
  }
});

test('portfolio examples are labelled as original concepts and accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/portfolio');
  await expect(page.locator('.sample-card')).toHaveCount(3);
  await expect(page.locator('.sample-tag').first()).toContainText('NOT A CLIENT');
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('contact gives tech and business visitors direct choices, including policies', async ({
  page,
}) => {
  await page.goto('/contact');
  await page.getByRole('link', { name: 'Ask about a tech problem', exact: true }).click();
  await expect(page.locator('#inquiry-form')).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.goto('/contact');
  await page.getByRole('link', { name: 'Ask about business setup', exact: true }).click();
  await expect(page.locator('#project-dialog')).toBeVisible();
  await expect(page.locator('#project-form [name=projectType]')).toHaveValue(
    'Business email or Microsoft 365 setup',
  );
  await page.keyboard.press('Escape');
  await page.goto('/contact');
  await page.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page.locator('#privacy-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).not.toHaveURL(/#privacy$/);
});

test('request deep links can reopen after closing and keep unfinished input', async ({ page }) => {
  await page.goto('/#website-quote');
  await page.locator('#project-name').fill('Draft Customer');
  await page.keyboard.press('Escape');
  await expect(page).not.toHaveURL(/#website-quote$/);
  await page.goto('/#website-quote');
  await expect(page.locator('#project-dialog')).toBeVisible();
  await expect(page.locator('#project-name')).toHaveValue('Draft Customer');
});

test('hero tech action reaches the short inquiry before appointment details', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('.hero-actions')
    .getByRole('link', { name: 'Ask about a tech problem' })
    .click();
  await expect(page.locator('#inquiry-form')).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('every service page passes automated WCAG 2.2 checks and has unique metadata', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const titles = new Set();
  for (const path of [
    '/remote-tech-support',
    '/website-design',
    '/website-maintenance',
    '/business-solutions',
    '/portfolio',
    '/about',
    '/contact',
  ]) {
    await page.goto(path);
    const title = await page.title();
    expect(titles.has(title), path).toBe(false);
    titles.add(title);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(
      (await page.locator('meta[name=description]').getAttribute('content')).length,
    ).toBeGreaterThan(30);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations, path).toEqual([]);
  }
});
