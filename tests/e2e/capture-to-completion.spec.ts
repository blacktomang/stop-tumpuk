import { expect, test } from '@playwright/test';

test('captures, estimates, commits, completes, and retains a takeaway', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Article or video URL').fill('https://example.com/learning');
  await page.getByRole('button', { name: 'Save to Inbox' }).click();
  await expect(page.getByText('Saved to Inbox.')).toBeVisible();
  await page.getByRole('button', { name: 'Edit estimate' }).click();
  await page.getByLabel('Minutes').fill('10');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('button', { name: 'Commit' }).click();
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByRole('button', { name: 'Complete' }).click();
  await page.getByPlaceholder('What do you want to remember?').fill('Useful learning note');
  await page.getByRole('button', { name: 'Save takeaway' }).click();
  await expect(page.getByRole('heading', { name: 'Completed' })).toBeVisible();
  await page.getByRole('button', { name: 'Notes' }).click();
  await expect(page.getByText('Useful learning note')).toBeVisible();
});
