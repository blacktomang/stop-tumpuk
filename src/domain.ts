import type { DurationSource, Material, MaterialType } from './types';

export const secondsPerMinute = 60;
export const roundMinutes = (seconds: number) => Math.max(0, Math.ceil(seconds / secondsPerMinute));
export const formatDuration = (seconds: number | null) =>
  seconds === null ? 'Unknown' : `${roundMinutes(seconds)} min`;
export const consumptionSeconds = (m: Material) =>
  m.contentSeconds === null ? null : Math.round(m.contentSeconds / m.playbackSpeed);
export const effortSeconds = (m: Material) =>
  m.manualEffortSeconds ??
  (consumptionSeconds(m) === null ? null : Math.round((consumptionSeconds(m) ?? 0) * m.effortMultiplier));
export const weeklyCapacitySeconds = (weekday: number | null, weekend: number | null) =>
  weekday === null || weekend === null ? null : (weekday * 5 + weekend * 2) * secondsPerMinute;
export function backlog(materials: Material[], weekday: number | null, weekend: number | null) {
  const active = materials.filter((m) => m.status === 'queued' || m.status === 'in-progress');
  const known = active
    .map(effortSeconds)
    .filter((v): v is number => v !== null)
    .reduce((sum, v) => sum + v, 0);
  const unknown = active.filter((m) => effortSeconds(m) === null).length;
  const capacity = weeklyCapacitySeconds(weekday, weekend);
  return {
    active: active.length,
    known,
    unknown,
    capacity,
    clearanceWeeks: capacity && capacity > 0 ? known / capacity : null,
  };
}
export function classifyUrl(raw: string): { url: URL; type: MaterialType; source: DurationSource } {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use a valid HTTP(S) link.');
  const host = url.hostname.toLowerCase();
  return {
    url,
    type: host.includes('youtube.com') || host.includes('youtu.be') ? 'video' : 'article',
    source: 'unknown',
  };
}
export const normalizeUrl = (url: URL) => {
  const copy = new URL(url);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) =>
    copy.searchParams.delete(key),
  );
  return copy.toString();
};
export function extractSharedUrl(value: string): string | null {
  const candidate = value.match(/https?:\/\/[^\s<>()]+/iu)?.[0];
  return candidate ?? null;
}
export function inferredTitle(url: URL) {
  return (
    url.hostname.replace(/^www\./, '') +
    (url.pathname === '/' ? '' : url.pathname.replace(/[-_/]/g, ' ').replace(/^\s+|\s+$/g, ''))
  );
}
export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  // Segmenter recognizes word boundaries in languages that do not use spaces,
  // rather than presenting a whitespace-only approximation as authoritative.
  if ('Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
    return Array.from(segmenter.segment(trimmed)).filter((segment) => segment.isWordLike).length;
  }

  return trimmed.split(/\s+/u).length;
}

export interface RecommendationResult {
  fitting: Material[];
  partial: Material | null;
}

/**
 * Rank active materials predictably for a user's available time. Unknown estimates
 * stay out of automatic recommendations: they may be opened manually, but cannot
 * truthfully be described as fitting a time budget.
 */
export function recommendMaterials(materials: Material[], availableSeconds: number): RecommendationResult {
  const active = materials.filter(
    (material) => material.status === 'queued' || material.status === 'in-progress',
  );
  const known = active
    .map((material) => ({ material, effort: effortSeconds(material) }))
    .filter((entry): entry is { material: Material; effort: number } => entry.effort !== null);
  const compare = (
    left: { material: Material; effort: number },
    right: { material: Material; effort: number },
  ) =>
    left.material.priority - right.material.priority ||
    Number(right.material.status === 'in-progress') - Number(left.material.status === 'in-progress') ||
    left.effort - right.effort ||
    left.material.createdAt.localeCompare(right.material.createdAt) ||
    left.material.id.localeCompare(right.material.id);
  const ordered = known.sort(compare);

  return {
    fitting: ordered.filter((entry) => entry.effort <= availableSeconds).map((entry) => entry.material),
    partial: ordered.find((entry) => entry.effort > availableSeconds)?.material ?? null,
  };
}
