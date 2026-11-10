import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { endSession, pauseSession, resumeSession, startSession } from './session-repository';
import type { Material } from '../types';

const material: Material = {
  id: 'timer-material',
  originalUrl: 'https://example.com/article',
  normalizedUrl: 'https://example.com/article',
  domain: 'example.com',
  title: 'Timer material',
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
  await db.transaction('rw', db.materials, db.sessions, async () => {
    await Promise.all([db.materials.clear(), db.sessions.clear()]);
  });
  await db.materials.add(material);
});

afterEach(async () => {
  await db.transaction('rw', db.materials, db.sessions, async () => {
    await Promise.all([db.materials.clear(), db.sessions.clear()]);
  });
});

describe('fixed focus timer', () => {
  it('persists pause and resume state through a database reopen without changing the material estimate', async () => {
    const started = await startSession(material.id);
    await pauseSession(started);
    db.close();
    await db.open();

    const paused = await db.sessions.get(started.id);
    expect(paused).toMatchObject({ state: 'paused', endedAt: null });
    await resumeSession(paused!);
    expect(await db.sessions.get(started.id)).toMatchObject({ state: 'running' });
    expect(await db.materials.get(material.id)).toMatchObject({
      status: 'queued',
      sourceDurationSeconds: 600,
    });
  });

  it('ends a timer interval without finishing the material', async () => {
    const started = await startSession(material.id);
    await endSession(started);

    expect(await db.sessions.get(started.id)).toMatchObject({ state: 'ended' });
    expect(await db.materials.get(material.id)).toMatchObject({ status: 'queued' });
  });
});
