import { expect, test } from '@playwright/test';

test('shows capacity, recommends one item, and finishes without a note', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Save to Inbox' }).click();
  await expect(page.getByText('Saved to Inbox.')).toBeVisible();
  await page.getByRole('button', { name: 'Edit estimate' }).click();
  await page.getByLabel('Estimated time (minutes)').fill('10');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('button', { name: 'Commit' }).click();
  await expect(page.getByText('Read next · fits your time')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open' })).toHaveCount(1);
  await expect(page.getByRole('meter', { name: 'Reading plan capacity' })).toHaveAttribute(
    'aria-valuetext',
    '10 of 135 minutes available this week',
  );
  expect(
    await page
      .locator('.capacity-meter__fill')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThanOrEqual(0.001);
  await page.getByRole('button', { name: 'Open' }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Save a takeaway?' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Notes', exact: true }).click();
  await page.getByRole('button', { name: 'New note' }).click();
  await page.getByLabel('New note').fill('Useful learning note');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByText('Useful learning note')).toBeVisible();
});
