import { expect, test } from '@playwright/test';

const importedData = {
  format: 'stop-tumpuk-reading-plan',
  version: 1,
  exportedAt: '2026-11-10T00:00:00.000Z',
  settings: null,
  materials: [
    {
      id: 'imported-material',
      originalUrl: 'https://example.com/imported',
      normalizedUrl: 'https://example.com/imported',
      domain: 'example.com',
      title: 'Imported material',
      thumbnailUrl: null,
      type: 'article',
      status: 'inbox',
      sourceDurationSeconds: null,
      sourceDurationProvenance: 'unknown',
      sourceDurationCompleteness: 'unknown',
      playbackSpeed: 1,
      manualEstimatedSeconds: null,
      createdAt: '2026-11-10T00:00:00.000Z',
      updatedAt: '2026-11-10T00:00:00.000Z',
    },
  ],
  notes: [],
  events: [
    {
      id: 'imported-event',
      materialId: 'imported-material',
      type: 'captured',
      at: '2026-11-10T00:00:00.000Z',
    },
  ],
  sessions: [],
};

test('uses contextual actions through capture, reading, notes, and finishing', async ({ page }) => {
test('captures to the Reading plan by default, preserves Inbox as an explicit choice, and finishes with notes on demand', async ({
  page,
}) => {
  await page.route('https://www.youtube.com/oembed**', async (route) => {
    await route.fulfill({
      json: { title: 'Mocked focus video', thumbnail_url: 'https://example.com/thumbnail.jpg' },
    });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('switch', { name: 'Enable weekly availability' }).click();
  await page
    .getByRole('group', { name: /Weekdays/ })
    .getByLabel('Minutes')
    .selectOption('15');
  await page
    .getByRole('group', { name: /Weekends/ })
    .getByLabel('Minutes')
    .selectOption('30');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('meter', { name: 'Reading plan capacity' })).toBeVisible();
  await page
    .getByLabel('Article or video URL')
    .fill('https://github.com/cypress-io/cypress-documentation/issues/5816');
  await page.getByRole('radio', { name: 'Inbox' }).check();
  await page.getByRole('button', { name: 'Save to Inbox' }).click();
  await expect(page.getByRole('status')).toContainText('Saved to Inbox.');
  const inbox = page.locator('#inbox');
  const advancedActions = inbox.getByRole('button', { name: /Advanced actions for/ });
  await advancedActions.click();
  const materialMenu = page.getByRole('menu');
  await expect(materialMenu).toBeVisible();
  const menuBox = await materialMenu.boundingBox();
  expect(menuBox?.x).toBeGreaterThanOrEqual(0);
  expect((menuBox?.x ?? 0) + (menuBox?.width ?? 0)).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.keyboard.press('Escape');
  await expect(advancedActions).toBeFocused();
  await advancedActions.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Source URL')).toBeFocused();
  await page.getByLabel('Estimated time (minutes)').fill('10');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await inbox.getByRole('button', { name: 'Add to Reading plan' }).click();
  await page.getByLabel('Status').selectOption('queued');
  await expect(page.locator('#reading-plan').getByRole('link', { name: 'Open source' })).toBeVisible();
  await page.getByLabel('Status').selectOption('all');
  await expect(page.getByText('Read next · fits your time')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open' })).toHaveCount(1);

  await page.getByLabel('Article or video URL').fill('https://www.youtube.com/watch?v=focus-video');
  await page.getByRole('button', { name: 'Save to Reading plan' }).click();
  await expect(
    page.getByText('Saved to your Reading plan. Add an estimate when you are ready.'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Mocked focus video' })).toBeVisible();

  await page.getByRole('button', { name: 'Advanced actions for Mocked focus video' }).first().click();
  await page.getByRole('menuitem', { name: 'Edit estimated time' }).click();
  await page.getByLabel('Estimated time (minutes)').fill('10');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await page.getByRole('radio', { name: 'Inbox' }).check();
  await page.getByLabel('Article or video URL').fill('https://example.com/inbox-link');
  await page.getByRole('button', { name: 'Save to Inbox' }).click();
  await expect(page.getByText('Saved to Inbox. It is not part of your Reading plan yet.')).toBeVisible();
  await expect(page.getByRole('meter', { name: 'Reading plan capacity' })).toHaveAttribute(
    'aria-valuetext',
    '10 of 135 minutes available this week',
  );

  await expect(page.getByText('Read next · fits your time')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open', exact: true })).toHaveCount(1);
  expect(
    await page
      .locator('.capacity-meter__fill')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThanOrEqual(0.001);
  await page.getByRole('button', { name: 'Open' }).click();
  await page.getByRole('button', { name: 'Session options' }).click();
  await page.getByRole('menuitem', { name: 'Mark as in progress' }).click();
  await expect(page.getByRole('button', { name: 'Finish', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Session options' }).click();

  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Save a takeaway?' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Advanced actions for Mocked focus video' }).click();
  await page.getByRole('menuitem', { name: 'Notes' }).click();
  await page.getByRole('button', { name: 'New note' }).click();
  await page.getByLabel('New note').fill('Useful learning note');
  await page.getByRole('button', { name: 'Save note' }).click();
  await page.getByRole('button', { name: 'New note' }).click();
  await page.getByLabel('New note').fill('Second learning note');
  await page.getByRole('button', { name: 'Save note' }).click();
  await page.getByRole('searchbox', { name: 'Search notes' }).fill('second');
  await expect(page.getByText('Useful learning note')).toHaveCount(0);
  await page.getByRole('button', { name: 'Note actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.getByLabel('Edit note').fill('Second revised note');
  await page.getByRole('button', { name: 'Save note' }).click();
  await page.getByRole('button', { name: 'Note actions' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByText('No notes match that search.')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search notes' }).fill('');
  await expect(page.getByText('Useful learning note')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
  await page.getByRole('button', { name: 'Notes', exact: true }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Advanced actions for Mocked focus video' }).click();
  await page.getByRole('menuitem', { name: 'Notes' }).click();
  await expect(page.getByText('Useful learning note')).toBeVisible();
});

test('uses a dedicated import preview without export controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip for 3 months' }).click();
  await page.getByRole('button', { name: 'Data' }).click();
  await page.getByLabel('Select an export file').setInputFiles({
    name: 'import.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(importedData)),
  });
  await expect(page.getByRole('heading', { name: 'Review import' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download export' })).toHaveCount(0);
  await expect(page.getByText('2 new records will be added.')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Back up or move your library' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download export' })).toBeVisible();
});

test('keeps the mobile menu closable and layouts within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip for 3 months' }).click();
  const menuToggle = page.getByRole('button', { name: 'Open navigation menu' });
  expect(
    await menuToggle.evaluate((element) => element.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(44);
  await menuToggle.click();
  await page.keyboard.press('Escape');
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();
  await page.mouse.click(20, 400);
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  await menuToggle.click();
  await page.getByRole('link', { name: 'Reading plan' }).click();
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();
  await page
    .getByRole('navigation', { name: 'stop-tumpuk navigation' })
    .getByRole('button', { name: 'Set time' })
    .click();
  const availabilityHeading = page.getByRole('heading', { name: 'Learning availability' });
  await expect(availabilityHeading).toBeVisible();
  expect(
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog?.contains(document.activeElement) ?? false;
    }),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(availabilityHeading).toHaveCount(0);
  await expect(menuToggle).toBeFocused();
  await expect(
    page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).resolves.toBe(true);
});
