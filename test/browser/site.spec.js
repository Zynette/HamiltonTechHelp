import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
  test(`responsive layout, no overflow, and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toContainText('Friendly remote');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    await page.locator('.all-services summary').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.locator('.hero [data-book]').click();
    await expect(page.locator('#booking-dialog')).toBeVisible();
    const dialogResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(dialogResults.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await page.locator('#websites [data-dialog=project-dialog]').click();
    await expect(page.locator('#project-dialog')).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    expect(
      await page
        .locator('#project-dialog')
        .evaluate((element) => element.scrollWidth > element.clientWidth),
    ).toBe(false);
    if ([390, 1440].includes(width)) {
      await page.screenshot({ path: `test-results/project-${width}.png` });
      await page.keyboard.press('Escape');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}
test('inquiry validates, preserves errors, and only shows success after acceptance', async ({
  page,
}) => {
  await page.goto('/');
  const form = page.locator('#inquiry-form');
  await form.getByRole('button', { name: 'Ask about my issue' }).click();
  await expect(form.locator('[name=name]')).toHaveAttribute('aria-invalid', 'true');
  await form.locator('[name=name]').fill('Test Customer');
  await form.locator('[name=email]').fill('failure@example.com');
  await form.locator('[name=device]').selectOption('Windows laptop');
  await form.locator('[name=description]').fill('My computer is slow when opening email.');
  await form.getByRole('button', { name: 'Ask about my issue' }).click();
  await expect(form.locator('.form-status')).toHaveAttribute('data-state', 'error');
  await expect(form.locator('[name=description]')).toHaveValue(
    'My computer is slow when opening email.',
  );
  await form.locator('[name=email]').fill('customer@example.com');
  await form.getByRole('button', { name: 'Ask about my issue' }).click();
  await expect(form.locator('.form-status')).toContainText('Thanks — I got your message.');
  await expect(form.locator('[name=description]')).toHaveValue('');
});
test('booking presets, validation, consent and request confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Request remote help' }).click();
  const form = page.locator('#booking-form');
  await expect(form.locator('[name=method]')).toHaveValue('Remote');
  await form.locator('[name=category]').selectOption('General computer problem');
  await form.locator('[name=device]').selectOption('Printer/scanner');
  await form.locator('[name=description]').fill('The printer is showing as offline.');
  await form.locator('[name=date]').fill('2099-10-02');
  await form.locator('[name=window]').fill('Weekday mornings, if available');
  await form.locator('[name=name]').fill('Test Customer');
  await form.locator('[name=email]').fill('customer@example.com');
  await form.getByRole('button', { name: 'Request appointment' }).click();
  await expect(form.locator('[name=consent]')).toHaveAttribute('aria-invalid', 'true');
  await form.locator('[name=consent]').check();
  await form.getByRole('button', { name: 'Request appointment' }).click();
  await expect(form.locator('.form-status')).toContainText('appointment request has been received');
  await expect(form.locator('.form-status')).not.toContainText('Your appointment is confirmed');
});
test('keyboard dialog focus, nested privacy, escape and focus return', async ({ page }) => {
  await page.goto('/');
  const opener = page.locator('.hero [data-book]');
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#booking-dialog')).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  expect(
    await page.evaluate(() => document.activeElement.closest('#booking-dialog') !== null),
  ).toBe(true);
  await page.locator('#booking-dialog [data-dialog=privacy-dialog]').click();
  await expect(page.locator('#privacy-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#privacy-dialog')).not.toBeVisible();
  await expect(page.locator('#booking-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});
test('mobile menu, category prefilling and FAQ interaction', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('#navigation')).toBeVisible();
  await page.locator('#navigation').getByRole('link', { name: 'Tech help', exact: true }).click();
  await expect(page.locator('#navigation')).not.toBeVisible();
  await page.locator('.problem-list [data-category="Printer/scanner"]').click();
  await expect(page.locator('#inquiry-device')).toHaveValue('Printer/scanner');
  await expect(page.locator('#inquiry-description')).toHaveValue(/printer\/scanner/);
  const item = page.locator('.faq-list details').first();
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open', '');
});
test('website project form validates, preserves failed requests and confirms only receipt', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const opener = page.locator('#websites [data-dialog=project-dialog]');
  await opener.click();
  const form = page.locator('#project-form');
  await expect(form.locator('[name=device], [name=date], [name=method]')).toHaveCount(0);
  await form.getByRole('button', { name: 'Send website inquiry' }).click();
  await expect(form.locator('[name=name]')).toHaveAttribute('aria-invalid', 'true');
  await form.locator('[name=name]').fill('Test Customer');
  await form.locator('[name=email]').fill('failure@example.com');
  await form.locator('[name=projectType]').selectOption('Mobile layout or website troubleshooting');
  await form.locator('[name=siteUrl]').fill('https://example.com');
  await form
    .locator('[name=description]')
    .fill('The mobile navigation needs fixing on my existing site.');
  await form.locator('[name=timeframe]').fill('Flexible');
  await form.getByRole('button', { name: 'Send website inquiry' }).click();
  await expect(form.locator('.form-status')).toHaveAttribute('data-state', 'error');
  await expect(form.locator('[name=description]')).toHaveValue(/mobile navigation/);
  await form.locator('[data-dialog=terms-dialog]').click();
  await expect(page.locator('#terms-dialog')).toContainText('Website projects');
  await page.keyboard.press('Escape');
  await expect(form.locator('[data-dialog=terms-dialog]')).toBeFocused();
  await form.locator('[name=email]').fill('customer@example.com');
  await form.getByRole('button', { name: 'Send website inquiry' }).click();
  await expect(form.locator('.form-status')).toContainText(
    'No project or deadline is confirmed yet.',
  );
  await expect(form.locator('[name=description]')).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});
test('reduced motion disables scrolling animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  );
});

test('hero website inquiry is distinct and returns focus to its trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('.hero-actions').getByRole('button', { name: 'Discuss a website' });
  await trigger.click();
  await expect(page.locator('#project-dialog')).toBeVisible();
  await expect(page.locator('#booking-dialog')).not.toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('layouts reflow across breakpoints and short phone screens', async ({ page }) => {
  await page.goto('/');
  for (const width of [280, 360, 620, 621, 850, 851, 1100, 1101, 1600, 2560]) {
    await page.setViewportSize({ width, height: 800 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `page at ${width}px`,
    ).toBeLessThanOrEqual(width);
    const menu = page.locator('.menu-toggle');
    if (await menu.isVisible()) {
      await menu.click();
      await expect(page.locator('#navigation')).toBeVisible();
      expect(
        await page.locator('#navigation').evaluate((el) => el.scrollWidth > el.clientWidth),
        `menu at ${width}px`,
      ).toBe(false);
      await page.keyboard.press('Escape');
    }
    await page.locator('.hero-actions [data-dialog]').click();
    expect(
      await page.locator('#project-dialog').evaluate((el) => el.scrollWidth > el.clientWidth),
      `dialog at ${width}px`,
    ).toBe(false);
    await page.keyboard.press('Escape');
    if (width > 620) {
      const bottoms = await page
        .locator('.pricing-main .button')
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().bottom));
      expect(Math.abs(bottoms[0] - bottoms[1]), `pricing alignment at ${width}px`).toBeLessThan(1);
    }
  }
  await page.setViewportSize({ width: 390, height: 400 });
  await page.locator('.menu-toggle').click();
  const menuAction = page.locator('#navigation .button');
  await menuAction.scrollIntoViewIfNeeded();
  const menuBox = await menuAction.boundingBox();
  expect(menuBox.y).toBeGreaterThanOrEqual(0);
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(400);
  await page.keyboard.press('Escape');
  await page.locator('.hero-actions [data-dialog]').click();
  const submit = page.locator('#project-form [type=submit]');
  await submit.scrollIntoViewIfNeeded();
  const box = await submit.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(400);
  await page.keyboard.press('Escape');
});
