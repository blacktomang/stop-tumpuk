import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { CommitmentDb, databaseName, databaseSchemaVersion } from './db';
import type { Material, Note } from './types';

const now = '2026-11-10T00:00:00.000Z';
const sampleMaterial = (id = 'material-1'): Material => ({
  id,
  originalUrl: 'https://example.com/article',
  normalizedUrl: 'https://example.com/article',
  domain: 'example.com',
  title: 'Article',
  thumbnailUrl: null,
  type: 'article',
  status: 'queued',
  sourceDurationSeconds: null,
  sourceDurationProvenance: 'unknown',
  sourceDurationCompleteness: 'unknown',
  playbackSpeed: 1,
  manualEstimatedSeconds: 0,
  createdAt: now,
  updatedAt: now,
});

const opened: CommitmentDb[] = [];
function testDb(name: string) {
  const database = new CommitmentDb(name);
  opened.push(database);
  return database;
}

afterEach(async () => {
  await Promise.all(
    opened.splice(0).map(async (database) => {
      database.close();
      await database.delete();
    }),
  );
});

describe('Milestone 1 database replacement', () => {
  it('initializes the one-time reading-plan schema without reading prototype records', async () => {
    const legacy = new Dexie('stop-tumpuk');
    legacy.version(4).stores({ materials: 'id' });
    await legacy.open();
    await legacy.table('materials').add({ id: 'prototype-material', priority: 1 });

    const current = testDb(databaseName);
    await current.open();
    expect(databaseSchemaVersion).toBe(1);
    expect(await current.materials.toArray()).toEqual([]);
    expect(await legacy.table('materials').count()).toBe(1);

    legacy.close();
    await legacy.delete();
  });

  it('retains current records on a subsequent launch and keeps independent notes', async () => {
    const name = `stop-tumpuk-reading-plan-test-${crypto.randomUUID()}`;
    const firstLaunch = testDb(name);
    await firstLaunch.materials.add(sampleMaterial());
    const firstNote: Note = {
      id: 'note-1',
      materialId: 'material-1',
      content: 'First',
      createdAt: now,
      updatedAt: now,
    };
    const secondNote: Note = {
      id: 'note-2',
      materialId: 'material-1',
      content: 'Second',
      createdAt: now,
      updatedAt: now,
    };
    await firstLaunch.notes.bulkAdd([firstNote, secondNote]);
    firstLaunch.close();

    const nextLaunch = testDb(name);
    expect(await nextLaunch.materials.get('material-1')).toMatchObject({ manualEstimatedSeconds: 0 });
    expect(await nextLaunch.notes.where('materialId').equals('material-1').count()).toBe(2);
  });

  it('rolls back a failed multi-store write instead of leaving a partial import', async () => {
    const current = testDb(`stop-tumpuk-reading-plan-rollback-${crypto.randomUUID()}`);
    await expect(
      current.transaction('rw', current.materials, current.notes, async () => {
        await current.materials.add(sampleMaterial());
        await current.notes.add({
          id: 'note-1',
          materialId: 'material-1',
          content: 'Note',
          createdAt: now,
          updatedAt: now,
        });
        throw new Error('simulated interrupted import');
      }),
    ).rejects.toThrow('interrupted');
    expect(await current.materials.count()).toBe(0);
    expect(await current.notes.count()).toBe(0);
  });
});
