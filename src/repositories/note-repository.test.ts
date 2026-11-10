import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { createNote, deleteNote, updateNote } from './note-repository';
import type { Material } from '../types';

const material: Material = {
  id: 'note-material',
  originalUrl: 'https://example.com/notes',
  normalizedUrl: 'https://example.com/notes',
  domain: 'example.com',
  title: 'Notes material',
  thumbnailUrl: null,
  type: 'article',
  status: 'completed',
  sourceDurationSeconds: null,
  sourceDurationProvenance: 'unknown',
  sourceDurationCompleteness: 'unknown',
  playbackSpeed: 1,
  manualEstimatedSeconds: null,
  createdAt: '2026-11-10T00:00:00.000Z',
  updatedAt: '2026-11-10T00:00:00.000Z',
};

beforeEach(async () => {
  await db.open();
  await db.transaction('rw', db.materials, db.notes, async () => {
    await Promise.all([db.materials.clear(), db.notes.clear()]);
  });
  await db.materials.add(material);
});

afterEach(async () => {
  await db.transaction('rw', db.materials, db.notes, async () => {
    await Promise.all([db.materials.clear(), db.notes.clear()]);
  });
});

describe('independent source notes', () => {
  it('edits and deletes one note without changing its sibling after completion', async () => {
    const first = await createNote(material.id, 'First note');
    const second = await createNote(material.id, 'Second note');

    await updateNote(first, 'Updated first note');
    expect(await db.notes.get(second.id)).toMatchObject({ content: 'Second note', materialId: material.id });

    await deleteNote(first);
    expect(await db.notes.get(first.id)).toBeUndefined();
    expect(await db.notes.get(second.id)).toMatchObject({ content: 'Second note', materialId: material.id });
    expect(await db.materials.get(material.id)).toMatchObject({ status: 'completed' });
  });
});
