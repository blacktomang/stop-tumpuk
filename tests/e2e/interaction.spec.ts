import { expect, test } from '@playwright/test';

test('keeps the material actions and mobile navigation keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip for 3 months' }).click();
  await page.getByLabel('Article or video URL').fill('https://example.com/keyboard-actions');
  await page.getByRole('button', { name: 'Save to Reading plan' }).click();

  const actions = page.getByRole('button', { name: /Advanced actions for example.comkeyboard actions/ });
  await actions.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitem', { name: 'Edit estimated time' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(actions).toBeFocused();

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('navigation', { name: 'stop-tumpuk navigation' })).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
});

test('supports the mobile paste-to-finish fallback flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
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
  await page.getByLabel('Article or video URL').fill('https://example.com/mobile-fallback');
  await page.getByRole('button', { name: 'Save to Reading plan' }).click();
  await page.getByRole('button', { name: /Advanced actions for example.commobile fallback/ }).click();
  await page.getByRole('menuitem', { name: 'Edit estimated time' }).click();
  await page.getByLabel('Estimated time (minutes)').fill('5');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('meter', { name: 'Reading plan capacity' })).toBeVisible();

  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open source ↗' })).toHaveAttribute(
    'href',
    'https://example.com/mobile-fallback',
  );
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
});
