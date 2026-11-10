import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { createNote } from './note-repository';
import { changeMaterialStatus } from './material-repository';
import type { Material } from '../types';

const material: Material = {
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
  manualEstimatedSeconds: null,
  createdAt: '2026-11-10T00:00:00.000Z',
  updatedAt: '2026-11-10T00:00:00.000Z',
};

beforeEach(async () => {
  await db.open();
  await db.transaction('rw', db.materials, db.events, db.notes, async () => {
    await Promise.all([db.materials.clear(), db.events.clear(), db.notes.clear()]);
  });
  await db.materials.add(material);
});

afterEach(async () => {
  await db.transaction('rw', db.materials, db.events, db.notes, async () => {
    await Promise.all([db.materials.clear(), db.events.clear(), db.notes.clear()]);
  });
});

describe('direct completion', () => {
  it('finishes transactionally without starting a timer or creating a note', async () => {
    await changeMaterialStatus(material, 'completed');

    expect(await db.materials.get(material.id)).toMatchObject({ status: 'completed' });
    expect(await db.events.where('materialId').equals(material.id).toArray()).toHaveLength(1);
    expect(await db.notes.where('materialId').equals(material.id).count()).toBe(0);
    expect(await db.sessions.where('materialId').equals(material.id).count()).toBe(0);
  });

  it('keeps a completed material finished when a later note save fails', async () => {
    await changeMaterialStatus(material, 'completed');
    await expect(createNote(material.id, '   ')).rejects.toThrow('Write a note');

    expect(await db.materials.get(material.id)).toMatchObject({ status: 'completed' });
  });

  it('does not record duplicate completion history when a finish command retries', async () => {
    await changeMaterialStatus(material, 'completed');
    await changeMaterialStatus({ ...material, status: 'completed' }, 'completed');

    expect(await db.events.where('materialId').equals(material.id).count()).toBe(1);
  });
});
