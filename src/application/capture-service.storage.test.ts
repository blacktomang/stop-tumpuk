import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { captureUrl } from './capture-service';

beforeEach(async () => {
  await db.transaction('rw', db.materials, db.events, db.captureIntake, async () => {
    await Promise.all([db.materials.clear(), db.events.clear(), db.captureIntake.clear()]);
  });
});

afterEach(async () => {
  await db.transaction('rw', db.materials, db.events, db.captureIntake, async () => {
    await Promise.all([db.materials.clear(), db.events.clear(), db.captureIntake.clear()]);
  });
});

describe('destination-aware capture storage', () => {
  it('captures directly to the Reading plan with one matching commitment event', async () => {
    const result = await captureUrl('https://example.com/reading-plan', 'queued');
    expect(result.kind).toBe('saved');
    if (result.kind !== 'saved') return;

    expect(result.material.status).toBe('queued');
    expect(
      (await db.events.where('materialId').equals(result.material.id).toArray())
        .map((event) => event.type)
        .sort(),
    ).toEqual(['captured', 'queued']);
  });

  it('leaves an Inbox capture uncommitted', async () => {
    const result = await captureUrl('https://example.com/inbox', 'inbox');
    expect(result.kind).toBe('saved');
    if (result.kind !== 'saved') return;

    expect(result.material.status).toBe('inbox');
    expect(await db.events.where('materialId').equals(result.material.id).toArray()).toMatchObject([
      { type: 'captured' },
    ]);
  });

  it('preserves the chosen destination through a duplicate retry', async () => {
    await captureUrl('https://example.com/duplicate', 'inbox');
    const duplicate = await captureUrl('https://example.com/duplicate', 'queued');
    expect(duplicate.kind).toBe('duplicate');
    if (duplicate.kind !== 'duplicate') return;

    const retried = await duplicate.retry();
    expect(retried.kind).toBe('saved');
    if (retried.kind !== 'saved') return;
    expect(retried.material.status).toBe('queued');
    expect(await db.events.where('materialId').equals(retried.material.id).count()).toBe(2);
  });

  it('consumes a shared intake in the same transaction as its chosen destination', async () => {
    await db.captureIntake.add({
      id: 'share-1',
      url: 'https://example.com/from-share',
      title: 'Shared article',
      receivedAt: '2026-11-10T00:00:00.000Z',
    });

    const result = await captureUrl('https://example.com/from-share', 'queued', {
      intakeId: 'share-1',
      intakeTitle: 'Shared article',
    });
    expect(result.kind).toBe('saved');
    if (result.kind !== 'saved') return;

    expect(result.material.title).toBe('Shared article');
    expect(await db.captureIntake.get('share-1')).toBeUndefined();
    expect(await db.events.where('materialId').equals(result.material.id).count()).toBe(2);
  });

  it('does not save when a share intake was already consumed', async () => {
    await expect(
      captureUrl('https://example.com/stale-share', 'queued', { intakeId: 'already-consumed' }),
    ).rejects.toThrow('no longer available');
    expect(await db.materials.count()).toBe(0);
    expect(await db.events.count()).toBe(0);
  });
});
