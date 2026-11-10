import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { captureUrl } from './capture-service';

beforeEach(async () => {
  await db.transaction('rw', db.materials, db.events, async () => {
    await Promise.all([db.materials.clear(), db.events.clear()]);
  });
});

afterEach(async () => {
  await db.transaction('rw', db.materials, db.events, async () => {
    await Promise.all([db.materials.clear(), db.events.clear()]);
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
});
