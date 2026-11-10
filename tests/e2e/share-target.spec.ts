import { expect, test, type Page } from '@playwright/test';

async function submitSharedText(page: Page) {
  const navigation = page.waitForURL(/capture=/);
  await page.evaluate(() => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/share';
    for (const [name, value] of [
      ['title', 'Shared article'],
      ['text', 'Read this later: https://example.com/from-shared-text'],
    ]) {
      const input = document.createElement('input');
      input.name = name;
      input.value = value;
      form.append(input);
    }
    document.body.append(form);
    form.submit();
  });
  await navigation;
}

test('stages shared text in the capture form and retains the selected destination on duplicate retry', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip for 3 months' }).click();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  await submitSharedText(page);
  await expect(page.getByLabel('Article or video URL')).toHaveValue('https://example.com/from-shared-text');
  await expect(page.getByText('Shared link ready to save.')).toBeVisible();
  await page.getByRole('radio', { name: 'Inbox' }).check();
  await page.getByRole('button', { name: 'Save to Inbox' }).click();
  await expect(page.getByText('Saved to Inbox. It is not part of your Reading plan yet.')).toBeVisible();

  await submitSharedText(page);
  await page.getByRole('radio', { name: 'Inbox' }).check();
  const confirmation = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Save to Inbox' }).click();
  const dialog = await confirmation;
  expect(dialog.message()).toContain('already saved');
  await dialog.accept();
  await expect(page.getByText('Saved to Inbox. It is not part of your Reading plan yet.')).toBeVisible();
  await expect(page.locator('#inbox .count-chip')).toHaveText('2');
});
