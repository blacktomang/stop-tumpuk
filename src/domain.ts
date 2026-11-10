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

export type CapacityState = 'unset' | 'zero' | 'empty' | 'under' | 'full' | 'overflow';

/**
 * The dashboard's single source of truth. `visualFraction` is intentionally
 * clamped for the meter; `plannedSeconds` and `overflowSeconds` retain the
 * true values for the text equivalent.
 */
export interface CapacityViewModel {
  state: CapacityState;
  activeCount: number;
  plannedSeconds: number;
  unknownCount: number;
  capacitySeconds: number | null;
  visualFraction: number | null;
  headroomSeconds: number | null;
  overflowSeconds: number | null;
  clearanceWeeks: number | null;
}

export function capacityViewModel(
  materials: Material[],
  weekday: number | null,
  weekend: number | null,
): CapacityViewModel {
  const summary = backlog(materials, weekday, weekend);
  const base = {
    activeCount: summary.active,
    plannedSeconds: summary.known,
    unknownCount: summary.unknown,
    capacitySeconds: summary.capacity,
  };
  if (summary.capacity === null) {
    return {
      ...base,
      state: 'unset',
      visualFraction: null,
      headroomSeconds: null,
      overflowSeconds: null,
      clearanceWeeks: null,
    };
  }
  if (summary.capacity === 0) {
    return {
      ...base,
      state: 'zero',
      visualFraction: null,
      headroomSeconds: null,
      overflowSeconds: summary.known,
      clearanceWeeks: null,
    };
  }
  if (summary.active === 0) {
    return {
      ...base,
      state: 'empty',
      visualFraction: 0,
      headroomSeconds: summary.capacity,
      overflowSeconds: null,
      clearanceWeeks: 0,
    };
  }
  if (summary.known > summary.capacity) {
    return {
      ...base,
      state: 'overflow',
      visualFraction: 1,
      headroomSeconds: null,
      overflowSeconds: summary.known - summary.capacity,
      clearanceWeeks: summary.known / summary.capacity,
    };
  }
  if (summary.known === summary.capacity) {
    return {
      ...base,
      state: 'full',
      visualFraction: 1,
      headroomSeconds: 0,
      overflowSeconds: null,
      clearanceWeeks: 1,
    };
  }
  return {
    ...base,
    state: 'under',
    visualFraction: summary.known / summary.capacity,
    headroomSeconds: summary.capacity - summary.known,
    overflowSeconds: null,
    clearanceWeeks: summary.known / summary.capacity,
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
  primary: Material | null;
  partial: Material | null;
  manual: Material[];
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
    primary: ordered.find((entry) => entry.estimate <= availableSeconds)?.material ?? null,
    partial:
      ordered.find((entry) => entry.estimate <= availableSeconds) === undefined
        ? (ordered.find((entry) => entry.estimate > availableSeconds)?.material ?? null)
        : null,
    manual: [
      ...ordered.map((entry) => entry.material),
      ...active.filter((material) => estimatedSeconds(material) === null),
    ],
  };
}
