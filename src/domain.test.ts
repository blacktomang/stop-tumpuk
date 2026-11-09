import { describe, expect, it } from 'vitest';
import {
  backlog,
  effortSeconds,
  extractSharedUrl,
  normalizeUrl,
  recommendMaterials,
  weeklyCapacitySeconds,
  wordCount,
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
  priority: 2,
  contentSeconds: 600,
  durationSource: 'manual',
  completeness: 'full',
  wordCount: null,
  playbackSpeed: 1,
  effortMultiplier: 1.5,
  manualEffortSeconds: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('Milestone 1 planning rules', () => {
  it('uses a manual total-effort override over derived effort', () => {
    expect(effortSeconds(material({ manualEffortSeconds: 1_200 }))).toBe(1_200);
  });

  it('keeps an unknown duration unknown instead of zero', () => {
    expect(effortSeconds(material({ contentSeconds: null }))).toBeNull();
  });

  it('uses weekday and weekend availability to calculate weekly capacity', () => {
    expect(weeklyCapacitySeconds(30, 60)).toBe(16_200);
    expect(weeklyCapacitySeconds(null, 60)).toBeNull();
  });

  it('marks backlog totals as partial when a committed item is unknown', () => {
    const result = backlog([material(), material({ id: 'unknown', contentSeconds: null })], 30, 60);
    expect(result).toMatchObject({ active: 2, known: 900, unknown: 1, capacity: 16_200 });
  });

  it('counts pasted whitespace-separated article text locally', () => {
    expect(wordCount('One  two\nthree')).toBe(3);
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

describe('Milestone 2 recommendation rules', () => {
  it('ranks fitting material by priority, then in-progress state and effort', () => {
    const result = recommendMaterials(
      [
        material({ id: 'lower-priority', priority: 3, manualEffortSeconds: 300 }),
        material({ id: 'in-progress', status: 'in-progress', priority: 2, manualEffortSeconds: 600 }),
        material({ id: 'shorter', priority: 2, manualEffortSeconds: 300 }),
      ],
      600,
    );

    expect(result.fitting.map((item) => item.id)).toEqual(['in-progress', 'shorter', 'lower-priority']);
  });

  it('does not claim unknown effort fits and offers a larger partial-session option', () => {
    const result = recommendMaterials(
      [
        material({ id: 'unknown', contentSeconds: null }),
        material({ id: 'long', manualEffortSeconds: 1_200 }),
      ],
      600,
    );

    expect(result.fitting).toEqual([]);
    expect(result.partial?.id).toBe('long');
  });
});
