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
