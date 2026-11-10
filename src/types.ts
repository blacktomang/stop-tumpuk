export type MaterialStatus = 'inbox' | 'queued' | 'in-progress' | 'completed' | 'archived';
export type MaterialType = 'article' | 'video' | 'unknown';
export type DurationProvenance = 'api-runtime' | 'publisher-estimate' | 'word-count' | 'manual' | 'unknown';
export type DurationCompleteness = 'full' | 'partial' | 'unknown';

export interface Material {
  id: string;
  originalUrl: string;
  normalizedUrl: string;
  domain: string;
  title: string;
  thumbnailUrl: string | null;
  type: MaterialType;
  status: MaterialStatus;
  /** A provider-derived duration, retained independently of a user correction. */
  sourceDurationSeconds: number | null;
  sourceDurationProvenance: DurationProvenance;
  sourceDurationCompleteness: DurationCompleteness;
  /** Used only for videos when deriving a planning estimate from source duration. */
  playbackSpeed: number;
  /** An explicit planning correction; null returns to the source-based estimate. */
  manualEstimatedSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: 'settings';
  weekdayMinutes: number | null;
  weekendMinutes: number | null;
  onboardingDismissed: boolean;
  availabilityReminderAt: string | null;
}

export interface MaterialEvent {
  id: string;
  materialId: string;
  type: 'captured' | 'queued' | 'in-progress' | 'completed' | 'reopened' | 'archived' | 'deleted';
  at: string;
}

export interface Note {
  id: string;
  materialId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type SessionState = 'running' | 'paused' | 'ended';
export interface LearningSession {
  id: string;
  materialId: string;
  startedAt: string;
  elapsedSeconds: number;
  state: SessionState;
  stateChangedAt: string;
  endedAt: string | null;
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
  | 'sourceDurationSeconds'
  | 'sourceDurationProvenance'
  | 'sourceDurationCompleteness'
  | 'playbackSpeed'
  | 'manualEstimatedSeconds'
>;
