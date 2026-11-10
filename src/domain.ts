import type { DurationProvenance, Material, MaterialType } from './types';

export const secondsPerMinute = 60;
export const roundMinutes = (seconds: number) => Math.max(0, Math.ceil(seconds / secondsPerMinute));
export const formatDuration = (seconds: number | null) =>
  seconds === null ? 'Time not estimated yet' : `${roundMinutes(seconds)} min`;

/** The sole planning-estimate calculation; zero is known and null is unknown. */
export function estimatedSeconds(material: Material): number | null {
  if (material.manualEstimatedSeconds !== null) return material.manualEstimatedSeconds;
  if (material.sourceDurationSeconds === null) return null;
  return material.type === 'video'
    ? Math.round(material.sourceDurationSeconds / material.playbackSpeed)
    : material.sourceDurationSeconds;
}

export function estimateLabel(material: Material): string {
  if (material.manualEstimatedSeconds !== null) return 'Manually set';
  switch (material.sourceDurationProvenance) {
    case 'api-runtime':
      return 'Video runtime';
    case 'publisher-estimate':
    case 'word-count':
      return 'Estimated';
    case 'manual':
      return 'Manually set';
    default:
      return 'Time not estimated yet';
  }
}

export const weeklyCapacitySeconds = (weekday: number | null, weekend: number | null) =>
  weekday === null || weekend === null ? null : (weekday * 5 + weekend * 2) * secondsPerMinute;

export function backlog(materials: Material[], weekday: number | null, weekend: number | null) {
  const active = materials.filter((m) => m.status === 'queued' || m.status === 'in-progress');
  const known = active
    .map(estimatedSeconds)
    .filter((value): value is number => value !== null)
    .reduce((sum, value) => sum + value, 0);
  const unknown = active.filter((material) => estimatedSeconds(material) === null).length;
  const capacity = weeklyCapacitySeconds(weekday, weekend);
  return {
    active: active.length,
    known,
    unknown,
    capacity,
    clearanceWeeks: capacity && capacity > 0 ? known / capacity : null,
  };
}

export function classifyUrl(raw: string): { url: URL; type: MaterialType; source: DurationProvenance } {
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

export interface RecommendationResult {
  fitting: Material[];
  partial: Material | null;
}

export function recommendMaterials(materials: Material[], availableSeconds: number): RecommendationResult {
  const active = materials.filter(
    (material) => material.status === 'queued' || material.status === 'in-progress',
  );
  const known = active
    .map((material) => ({ material, estimate: estimatedSeconds(material) }))
    .filter((entry): entry is { material: Material; estimate: number } => entry.estimate !== null);
  const ordered = known.sort(
    (left, right) =>
      Number(right.material.status === 'in-progress') - Number(left.material.status === 'in-progress') ||
      left.estimate - right.estimate ||
      left.material.createdAt.localeCompare(right.material.createdAt) ||
      left.material.id.localeCompare(right.material.id),
  );
  return {
    fitting: ordered.filter((entry) => entry.estimate <= availableSeconds).map((entry) => entry.material),
    partial: ordered.find((entry) => entry.estimate > availableSeconds)?.material ?? null,
  };
}
