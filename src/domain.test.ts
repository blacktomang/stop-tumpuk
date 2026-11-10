import { describe, expect, it } from 'vitest';
import {
  backlog,
  capacityViewModel,
  estimatedSeconds,
  extractSharedUrl,
  normalizeUrl,
  recommendMaterials,
  weeklyCapacitySeconds,
} from './domain';
import type { Material } from './types';

const material = (overrides: Partial<Material> = {}): Material => ({
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
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('Milestone 1 planning rules', () => {
  it('uses a manual estimated-time override over the preserved source duration', () => {
    expect(estimatedSeconds(material({ sourceDurationSeconds: 600, manualEstimatedSeconds: 1_200 }))).toBe(
      1_200,
    );
  });

  it('keeps zero as an explicit manual estimate', () => {
    expect(estimatedSeconds(material({ manualEstimatedSeconds: 0 }))).toBe(0);
  });

  it('returns to the source estimate when a manual correction is cleared', () => {
    expect(estimatedSeconds(material({ sourceDurationSeconds: 600, manualEstimatedSeconds: null }))).toBe(
      600,
    );
  });

  it('keeps an unknown duration unknown instead of zero', () => {
    expect(estimatedSeconds(material({ sourceDurationSeconds: null }))).toBeNull();
  });

  it('adjusts only video source runtimes for the retained playback speed preference', () => {
    expect(estimatedSeconds(material({ type: 'video', sourceDurationSeconds: 600, playbackSpeed: 2 }))).toBe(
      300,
    );
    expect(
      estimatedSeconds(material({ type: 'article', sourceDurationSeconds: 600, playbackSpeed: 2 })),
    ).toBe(600);
  });

  it('uses weekday and weekend availability to calculate weekly capacity', () => {
    expect(weeklyCapacitySeconds(30, 60)).toBe(16_200);
    expect(weeklyCapacitySeconds(null, 60)).toBeNull();
  });

  it('marks backlog totals as partial when a committed item is unknown', () => {
    const result = backlog([material(), material({ id: 'unknown', sourceDurationSeconds: null })], 30, 60);
    expect(result).toMatchObject({ active: 2, known: 600, unknown: 1, capacity: 16_200 });
  });

  it('models unset, zero, empty, under-capacity, full, and overflow plans without dividing by zero', () => {
    expect(capacityViewModel([material()], null, 60)).toMatchObject({
      state: 'unset',
      visualFraction: null,
      clearanceWeeks: null,
    });
    expect(capacityViewModel([material()], 0, 0)).toMatchObject({
      state: 'zero',
      visualFraction: null,
      clearanceWeeks: null,
    });
    expect(capacityViewModel([], 30, 60)).toMatchObject({
      state: 'empty',
      visualFraction: 0,
      headroomSeconds: 16_200,
    });
    expect(capacityViewModel([material()], 30, 60)).toMatchObject({
      state: 'under',
      visualFraction: 600 / 16_200,
      headroomSeconds: 15_600,
    });
    expect(capacityViewModel([material({ manualEstimatedSeconds: 16_200 })], 30, 60)).toMatchObject({
      state: 'full',
      visualFraction: 1,
      headroomSeconds: 0,
    });
    expect(capacityViewModel([material({ manualEstimatedSeconds: 18_000 })], 30, 60)).toMatchObject({
      state: 'overflow',
      visualFraction: 1,
      overflowSeconds: 1_800,
    });
  });

  it('keeps unknown estimates out of the meter while reporting their count', () => {
    expect(
      capacityViewModel([material(), material({ id: 'unknown', sourceDurationSeconds: null })], 30, 60),
    ).toMatchObject({ state: 'under', plannedSeconds: 600, unknownCount: 1 });
  });

  it('preserves a resource fragment while removing known campaign parameters', () => {
    const normalized = normalizeUrl(new URL('https://example.com/article?utm_source=social#section'));
    expect(normalized).toBe('https://example.com/article#section');
  });

  it('extracts an HTTP(S) URL from shared message text', () => {
    expect(extractSharedUrl('Read this: https://example.com/article today')).toBe(
      'https://example.com/article',
    );
  });
});

describe('recommendation ordering without priority', () => {
  it('prefers in-progress material, then shorter estimates, creation time, and stable ID', () => {
    const result = recommendMaterials(
      [
        material({ id: 'later', manualEstimatedSeconds: 300, createdAt: '2026-01-02T00:00:00.000Z' }),
        material({ id: 'in-progress', status: 'in-progress', manualEstimatedSeconds: 600 }),
        material({ id: 'first', manualEstimatedSeconds: 300, createdAt: '2026-01-01T00:00:00.000Z' }),
      ],
      600,
    );
    expect(result.primary?.id).toBe('in-progress');
    expect(result.manual.map((item) => item.id)).toEqual(['in-progress', 'first', 'later']);
  });

  it('does not claim unknown estimates fit and offers a longer partial-session option', () => {
    const result = recommendMaterials(
      [
        material({ id: 'unknown', sourceDurationSeconds: null }),
        material({ id: 'long', manualEstimatedSeconds: 1_200 }),
      ],
      600,
    );
    expect(result.primary).toBeNull();
    expect(result.partial?.id).toBe('long');
    expect(result.manual.map((item) => item.id)).toEqual(['long', 'unknown']);
  });

  it('uses stable IDs when all higher ranking fields tie', () => {
    const result = recommendMaterials(
      [
        material({ id: 'b', manualEstimatedSeconds: 300 }),
        material({ id: 'a', manualEstimatedSeconds: 300 }),
      ],
      300,
    );
    expect(result.primary?.id).toBe('a');
  });
});
