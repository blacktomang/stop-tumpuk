import { expect, test } from '@playwright/test';

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

  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Save a takeaway?' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Advanced actions for Mocked focus video' }).click();
  await page.getByRole('menuitem', { name: 'Notes' }).click();
  await page.getByRole('button', { name: 'New note' }).click();
  await page.getByLabel('New note').fill('Useful learning note');
  await page.getByRole('button', { name: 'Save note' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Advanced actions for Mocked focus video' }).click();
  await page.getByRole('menuitem', { name: 'Notes' }).click();
  await expect(page.getByText('Useful learning note')).toBeVisible();
});
