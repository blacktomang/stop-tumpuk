import { describe, expect, it } from 'vitest';
import { exportVersion, parseExport } from './data-transfer';

const valid = () => ({
  version: exportVersion,
  exportedAt: '2026-11-09T00:00:00.000Z',
  settings: null,
  notes: [],
  events: [],
  sessions: [],
  materials: [
    {
      id: 'm1',
      originalUrl: 'https://example.com/a',
      normalizedUrl: 'https://example.com/a',
      domain: 'example.com',
      title: 'A',
      thumbnailUrl: null,
      type: 'article',
      status: 'queued',
      priority: 2,
      contentSeconds: 60,
      durationSource: 'manual',
      completeness: 'full',
      wordCount: null,
      playbackSpeed: 1,
      effortMultiplier: 1.5,
      manualEffortSeconds: null,
      createdAt: '2026-11-09T00:00:00.000Z',
      updatedAt: '2026-11-09T00:00:00.000Z',
    },
  ],
});

describe('data export validation', () => {
  it('accepts a complete, versioned export envelope', () => {
    expect(parseExport(JSON.stringify(valid())).materials).toHaveLength(1);
  });
  it('rejects records with unsupported lifecycle values', () => {
    const data = JSON.parse(JSON.stringify(valid())) as { materials: Array<{ status: string }> };
    data.materials[0]!.status = 'invented';
    expect(() => parseExport(JSON.stringify(data))).toThrow('status');
  });
  it('rejects notes without an imported source material', () => {
    const data = JSON.parse(JSON.stringify(valid())) as {
      exportedAt: string;
      notes: Array<{ id: string; materialId: string; content: string; createdAt: string; updatedAt: string }>;
    };
    data.notes.push({
      id: 'n1',
      materialId: 'missing',
      content: 'note',
      createdAt: data.exportedAt,
      updatedAt: data.exportedAt,
    });
    expect(() => parseExport(JSON.stringify(data))).toThrow('reference');
  });
});
