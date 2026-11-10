import { describe, expect, it } from 'vitest';
import { exportFormat, exportVersion, parseExport } from './data-transfer';

const valid = () => ({
  format: exportFormat,
  version: exportVersion,
  exportedAt: '2026-11-10T00:00:00.000Z',
  settings: null,
  notes: [] as Array<{
    id: string;
    materialId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>,
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
      sourceDurationSeconds: 60,
      sourceDurationProvenance: 'publisher-estimate',
      sourceDurationCompleteness: 'full',
      playbackSpeed: 1,
      manualEstimatedSeconds: 0,
      createdAt: '2026-11-10T00:00:00.000Z',
      updatedAt: '2026-11-10T00:00:00.000Z',
    },
  ],
});

describe('current-format data export validation', () => {
  it('accepts the current versioned envelope, including a zero manual estimate', () => {
    expect(parseExport(JSON.stringify(valid())).materials[0]?.manualEstimatedSeconds).toBe(0);
  });

  it('rejects old and future envelope markers before records are considered', () => {
    const old = valid();
    delete (old as { format?: string }).format;
    expect(() => parseExport(JSON.stringify(old))).toThrow('format');
    expect(() => parseExport(JSON.stringify({ ...valid(), version: exportVersion + 1 }))).toThrow('format');
  });

  it('rejects records with unsupported lifecycle values', () => {
    const data = valid();
    data.materials[0]!.status = 'invented';
    expect(() => parseExport(JSON.stringify(data))).toThrow('material');
  });

  it('rejects notes without an imported source material', () => {
    const data = valid();
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
