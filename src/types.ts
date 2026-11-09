export type MaterialStatus = 'inbox' | 'queued' | 'in-progress' | 'completed' | 'archived';
export type MaterialType = 'article' | 'video' | 'unknown';
export type DurationSource = 'api-runtime' | 'publisher-estimate' | 'word-count' | 'manual' | 'unknown';
export type Completeness = 'full' | 'partial' | 'unknown';

export interface Material {
  id: string;
  originalUrl: string;
  normalizedUrl: string;
  domain: string;
  title: string;
  thumbnailUrl: string | null;
  type: MaterialType;
  status: MaterialStatus;
  priority: 1 | 2 | 3;
  contentSeconds: number | null;
  durationSource: DurationSource;
  completeness: Completeness;
  wordCount: number | null;
  playbackSpeed: number;
  effortMultiplier: number;
  manualEffortSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}
export interface Settings {
  id: 'settings';
  weekdayMinutes: number | null;
  weekendMinutes: number | null;
  readingWpm: number;
  onboardingDismissed: boolean;
  availabilityReminderAt: string | null;
}
export interface MaterialEvent {
  id: string;
  materialId: string;
  type: 'captured' | 'queued' | 'archived' | 'deleted';
  at: string;
}
export interface CaptureIntake {
  id: string;
  url: string;
  title: string | null;
  receivedAt: string;
}
export type MaterialDraft = Pick<
  Material,
  | 'title'
  | 'type'
  | 'priority'
  | 'contentSeconds'
  | 'durationSource'
  | 'completeness'
  | 'wordCount'
  | 'playbackSpeed'
  | 'effortMultiplier'
  | 'manualEffortSeconds'
>;
