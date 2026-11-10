import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const timestamp = '2026-11-10T00:00:00.000Z';
const importedMaterial = {
  id: 'imported-material',
  originalUrl: 'https://example.com/imported-reading',
  normalizedUrl: 'https://example.com/imported-reading',
  domain: 'example.com',
  title: 'Imported reading',
  thumbnailUrl: null,
  type: 'article',
  status: 'queued',
  sourceDurationSeconds: null,
  sourceDurationProvenance: 'unknown',
  sourceDurationCompleteness: 'unknown',
  playbackSpeed: 1,
  manualEstimatedSeconds: 12 * 60,
  createdAt: timestamp,
  updatedAt: timestamp,
};

function currentFormatExport() {
  return {
    format: 'stop-tumpuk-reading-plan',
    version: 1,
    exportedAt: timestamp,
    settings: {
      id: 'settings',
      weekdayMinutes: 15,
      weekendMinutes: 30,
      onboardingDismissed: true,
      availabilityReminderAt: null,
    },
    materials: [importedMaterial],
    notes: [
      {
        id: 'imported-note-1',
        materialId: importedMaterial.id,
        content: 'First imported note',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'imported-note-2',
        materialId: importedMaterial.id,
        content: 'Second imported note',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    events: [
      { id: 'imported-capture', materialId: importedMaterial.id, type: 'captured', at: timestamp },
      { id: 'imported-commitment', materialId: importedMaterial.id, type: 'queued', at: timestamp },
    ],
    sessions: [
      {
        id: 'imported-session',
        materialId: importedMaterial.id,
        startedAt: timestamp,
        elapsedSeconds: 120,
        state: 'paused',
        stateChangedAt: timestamp,
        endedAt: null,
      },
    ],
  };
}

test('round-trips current-format manual estimates, independent notes, and paused timers through the browser', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip for 3 months' }).click();
  await page.getByRole('button', { name: 'Data' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'current-format.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(currentFormatExport())),
  });
  await expect(page.getByRole('heading', { name: 'Import preview' })).toBeVisible();
  await expect(page.getByText('6 new records will be added.')).toBeVisible();
  await page.getByRole('button', { name: 'Import new records' }).click();
  await expect(page.getByRole('heading', { name: 'Back up or move your library' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('link', { name: 'Imported reading' })).toBeVisible();
  await expect(page.getByText('Estimated time:').locator('..')).toContainText('12 min');
  await page.reload();
  await expect(page.getByRole('link', { name: 'Imported reading' })).toBeVisible();

  await page.getByRole('button', { name: 'Advanced actions for Imported reading' }).first().click();
  await page.getByRole('menuitem', { name: 'Notes' }).click();
  await expect(page.getByText('First imported note')).toBeVisible();
  await expect(page.getByText('Second imported note')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to choices' }).click();

  await page.getByRole('button', { name: 'Data' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download export' }).click();
  const exportFile = await download;
  const exportPath = testInfo.outputPath('current-format.json');
  await exportFile.saveAs(exportPath);
  const exported = JSON.parse(await readFile(exportPath, 'utf8')) as ReturnType<typeof currentFormatExport>;
  expect(exported.materials[0]?.manualEstimatedSeconds).toBe(12 * 60);
  expect(exported.notes.map((note) => note.content)).toEqual(['First imported note', 'Second imported note']);
  expect(exported.sessions[0]).toMatchObject({ state: 'paused', materialId: importedMaterial.id });

  await page.getByRole('button', { name: 'Close' }).click();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Imported reading' })).toBeVisible();
  await page.context().setOffline(false);
});

test('retains the current database across a browser restart', async ({ browser }, testInfo) => {
  const userDataDir = testInfo.outputPath('restart-profile');
  const browserType = browser.browserType();
  const firstContext = await browserType.launchPersistentContext(userDataDir, { headless: true });
  const firstPage = await firstContext.newPage();
  await firstPage.goto('http://127.0.0.1:4173');
  await firstPage.getByRole('switch', { name: 'Enable weekly availability' }).click();
  await firstPage.getByRole('button', { name: 'Save', exact: true }).click();
  await firstPage.getByLabel('Article or video URL').fill('https://example.com/restart-persistence');
  await firstPage.getByRole('button', { name: 'Save to Reading plan' }).click();
  await expect(
    firstPage.getByText('Saved to your Reading plan. Add an estimate when you are ready.'),
  ).toBeVisible();
  await firstContext.close();

  const secondContext = await browserType.launchPersistentContext(userDataDir, { headless: true });
  const secondPage = await secondContext.newPage();
  await secondPage.goto('http://127.0.0.1:4173');
  await expect(secondPage.getByRole('link', { name: /restart persistence/ })).toBeVisible();
  await secondContext.close();
});
