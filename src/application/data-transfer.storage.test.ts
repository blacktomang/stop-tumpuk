import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import type { ExportEnvelope } from './data-transfer';
import { exportData, exportFormat, exportVersion, importData, previewImport } from './data-transfer';

const timestamp = '2026-11-10T00:00:00.000Z';
function currentExport(): ExportEnvelope {
  return {
    format: exportFormat,
    version: exportVersion,
    exportedAt: timestamp,
    settings: {
      id: 'settings',
      weekdayMinutes: 30,
      weekendMinutes: 60,
      onboardingDismissed: true,
      availabilityReminderAt: null,
    },
    materials: [
      {
        id: 'material-1',
        originalUrl: 'https://example.com/article',
        normalizedUrl: 'https://example.com/article',
        domain: 'example.com',
        title: 'Article',
        thumbnailUrl: null,
        type: 'article',
        status: 'queued',
        sourceDurationSeconds: 600,
        sourceDurationProvenance: 'publisher-estimate',
        sourceDurationCompleteness: 'full',
        playbackSpeed: 1,
        manualEstimatedSeconds: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    notes: [
      {
        id: 'note-1',
        materialId: 'material-1',
        content: 'First note',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'note-2',
        materialId: 'material-1',
        content: 'Second note',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    events: [{ id: 'event-1', materialId: 'material-1', type: 'captured', at: timestamp }],
    sessions: [
      {
        id: 'session-1',
        materialId: 'material-1',
        startedAt: timestamp,
        elapsedSeconds: 0,
        state: 'paused',
        stateChangedAt: timestamp,
        endedAt: null,
      },
    ],
  };
}

beforeEach(async () => {
  await db.transaction('rw', db.materials, db.notes, db.settings, db.events, db.sessions, async () => {
    await Promise.all([
      db.materials.clear(),
      db.notes.clear(),
      db.settings.clear(),
      db.events.clear(),
      db.sessions.clear(),
    ]);
  });
});
afterEach(async () => {
  await db.transaction('rw', db.materials, db.notes, db.settings, db.events, db.sessions, async () => {
    await Promise.all([
      db.materials.clear(),
      db.notes.clear(),
      db.settings.clear(),
      db.events.clear(),
      db.sessions.clear(),
    ]);
  });
});

describe('current-format additive imports', () => {
  it('previews and round-trips independent notes, a zero override, and paused timer state', async () => {
    const source = currentExport();
    const preview = await previewImport(JSON.stringify(source));
    expect(preview).toMatchObject({ conflicts: 0, importable: 6 });
    await importData(preview.data);

    const exported = await exportData();
    expect(exported.materials[0]?.manualEstimatedSeconds).toBe(0);
    expect(exported.notes.map((note) => note.content)).toEqual(['First note', 'Second note']);
    expect(exported.sessions[0]).toMatchObject({ state: 'paused', materialId: 'material-1' });
  });

  it('previews matching records and never overwrites a local record', async () => {
    const source = currentExport();
    await importData(source);
    const revised = structuredClone(source);
    revised.materials[0]!.title = 'Remote replacement';
    const preview = await previewImport(JSON.stringify(revised));
    expect(preview.conflicts).toBe(6);
    await importData(preview.data);
    expect((await db.materials.get('material-1'))?.title).toBe('Article');
  });

  it('leaves local data intact when unsupported or invalid imports are rejected before writes', async () => {
    const unsupported = { ...currentExport(), format: 'discarded-prototype' };
    await expect(importData(unsupported as unknown as ExportEnvelope)).rejects.toThrow('format');
    const invalid = currentExport();
    invalid.notes[0]!.materialId = 'missing';
    await expect(importData(invalid)).rejects.toThrow('reference');
    expect(await db.materials.count()).toBe(0);
    expect(await db.notes.count()).toBe(0);
  });
});
