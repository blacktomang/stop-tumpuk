import { db } from '../db';
import type { LearningSession, Material, MaterialEvent, Note, Settings } from '../types';

export const exportVersion = 1;
export interface ExportEnvelope {
  version: typeof exportVersion;
  exportedAt: string;
  materials: Material[];
  notes: Note[];
  settings: Settings | null;
  events: MaterialEvent[];
  sessions: LearningSession[];
}
export interface ImportPreview {
  data: ExportEnvelope;
  conflicts: number;
  importable: number;
}

const statuses = new Set(['inbox', 'queued', 'in-progress', 'completed', 'archived']);
const sources = new Set(['api-runtime', 'publisher-estimate', 'word-count', 'manual', 'unknown']);
const completeness = new Set(['full', 'partial', 'unknown']);
const eventTypes = new Set([
  'captured',
  'queued',
  'in-progress',
  'completed',
  'reopened',
  'archived',
  'deleted',
]);

function record(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(message);
  return value as Record<string, unknown>;
}
function string(value: unknown, message: string): string {
  if (typeof value !== 'string' || !value) throw new Error(message);
  return value;
}
function nullableNumber(value: unknown, message: string): number | null {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error(message);
  return value;
}
function array(value: unknown, message: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(message);
  return value;
}
function validDate(value: unknown, message: string): string {
  const parsed = string(value, message);
  if (Number.isNaN(Date.parse(parsed))) throw new Error(message);
  return parsed;
}
function validUrl(value: unknown): string {
  const url = new URL(string(value, 'Each material needs a URL.'));
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Each material needs an HTTP(S) URL.');
  return url.toString();
}

function material(value: unknown): Material {
  const input = record(value, 'A material record is invalid.');
  const status = string(input.status, 'A material status is invalid.');
  if (!statuses.has(status)) throw new Error('A material status is invalid.');
  const type = string(input.type, 'A material type is invalid.');
  if (!['article', 'video', 'unknown'].includes(type)) throw new Error('A material type is invalid.');
  const source = string(input.durationSource, 'A duration source is invalid.');
  const content = string(input.completeness, 'A content completeness value is invalid.');
  if (!sources.has(source) || !completeness.has(content)) throw new Error('A material estimate is invalid.');
  const priority = input.priority;
  if (priority !== 1 && priority !== 2 && priority !== 3) throw new Error('A material priority is invalid.');
  const playbackSpeed = nullableNumber(input.playbackSpeed, 'A playback speed is invalid.');
  const effortMultiplier = nullableNumber(input.effortMultiplier, 'An effort multiplier is invalid.');
  if (!playbackSpeed || !effortMultiplier)
    throw new Error('A playback speed and effort multiplier are required.');
  return {
    id: string(input.id, 'A material ID is missing.'),
    originalUrl: validUrl(input.originalUrl),
    normalizedUrl: validUrl(input.normalizedUrl),
    domain: string(input.domain, 'A material domain is missing.'),
    title: string(input.title, 'A material title is missing.'),
    thumbnailUrl: input.thumbnailUrl === null ? null : validUrl(input.thumbnailUrl),
    type: type as Material['type'],
    status: status as Material['status'],
    priority,
    contentSeconds: nullableNumber(input.contentSeconds, 'A content duration is invalid.'),
    durationSource: source as Material['durationSource'],
    completeness: content as Material['completeness'],
    wordCount: nullableNumber(input.wordCount, 'A word count is invalid.'),
    playbackSpeed,
    effortMultiplier,
    manualEffortSeconds: nullableNumber(input.manualEffortSeconds, 'Manual effort is invalid.'),
    createdAt: validDate(input.createdAt, 'A material date is invalid.'),
    updatedAt: validDate(input.updatedAt, 'A material date is invalid.'),
  };
}
function note(value: unknown): Note {
  const input = record(value, 'A note record is invalid.');
  return {
    id: string(input.id, 'A note ID is missing.'),
    materialId: string(input.materialId, 'A note material ID is missing.'),
    content: string(input.content, 'A note cannot be empty.'),
    createdAt: validDate(input.createdAt, 'A note date is invalid.'),
    updatedAt: validDate(input.updatedAt, 'A note date is invalid.'),
  };
}
function settings(value: unknown): Settings | null {
  if (value === null) return null;
  const input = record(value, 'Settings are invalid.');
  if (input.id !== 'settings' || typeof input.onboardingDismissed !== 'boolean')
    throw new Error('Settings are invalid.');
  const readingWpm = nullableNumber(input.readingWpm, 'Reading speed is invalid.');
  if (!readingWpm) throw new Error('Reading speed is invalid.');
  return {
    id: 'settings',
    weekdayMinutes: nullableNumber(input.weekdayMinutes, 'Weekday availability is invalid.'),
    weekendMinutes: nullableNumber(input.weekendMinutes, 'Weekend availability is invalid.'),
    readingWpm,
    onboardingDismissed: input.onboardingDismissed,
    availabilityReminderAt:
      input.availabilityReminderAt === null
        ? null
        : validDate(input.availabilityReminderAt, 'Availability reminder is invalid.'),
  };
}
function event(value: unknown): MaterialEvent {
  const input = record(value, 'An event record is invalid.');
  const type = string(input.type, 'An event type is invalid.');
  if (!eventTypes.has(type)) throw new Error('An event type is invalid.');
  return {
    id: string(input.id, 'An event ID is missing.'),
    materialId: string(input.materialId, 'An event material ID is missing.'),
    type: type as MaterialEvent['type'],
    at: validDate(input.at, 'An event date is invalid.'),
  };
}
function session(value: unknown): LearningSession {
  const input = record(value, 'A session record is invalid.');
  const state = string(input.state, 'A session state is invalid.');
  if (!['running', 'paused', 'ended'].includes(state)) throw new Error('A session state is invalid.');
  return {
    id: string(input.id, 'A session ID is missing.'),
    materialId: string(input.materialId, 'A session material ID is missing.'),
    startedAt: validDate(input.startedAt, 'A session date is invalid.'),
    elapsedSeconds: nullableNumber(input.elapsedSeconds, 'Elapsed time is invalid.') ?? 0,
    state: state as LearningSession['state'],
    stateChangedAt: validDate(input.stateChangedAt, 'A session date is invalid.'),
    endedAt: input.endedAt === null ? null : validDate(input.endedAt, 'A session date is invalid.'),
  };
}

export function parseExport(value: string): ExportEnvelope {
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    throw new Error('Choose a valid stop-tumpuk export file.');
  }
  const input = record(raw, 'Choose a valid stop-tumpuk export file.');
  if (input.version !== exportVersion) throw new Error('This export version is not supported.');
  const data: ExportEnvelope = {
    version: exportVersion,
    exportedAt: validDate(input.exportedAt, 'The export date is invalid.'),
    materials: array(input.materials, 'Materials are invalid.').map(material),
    notes: array(input.notes, 'Notes are invalid.').map(note),
    settings: settings(input.settings),
    events: array(input.events, 'Events are invalid.').map(event),
    sessions: array(input.sessions, 'Sessions are invalid.').map(session),
  };
  const ids = new Set(data.materials.map((item) => item.id));
  if (ids.size !== data.materials.length) throw new Error('Material IDs must be unique.');
  for (const item of [...data.notes, ...data.events, ...data.sessions])
    if (!ids.has(item.materialId))
      throw new Error('Every imported note, event, and session must reference an imported material.');
  return data;
}

export async function exportData(): Promise<ExportEnvelope> {
  const [materials, notes, settingsValue, events, sessions] = await Promise.all([
    db.materials.toArray(),
    db.notes.toArray(),
    db.settings.get('settings'),
    db.events.toArray(),
    db.sessions.toArray(),
  ]);
  return {
    version: exportVersion,
    exportedAt: new Date().toISOString(),
    materials,
    notes,
    settings: settingsValue ?? null,
    events,
    sessions,
  };
}

export async function previewImport(text: string): Promise<ImportPreview> {
  const data = parseExport(text);
  const ids = [...data.materials, ...data.notes, ...data.events, ...data.sessions].map((item) => item.id);
  const existing = await Promise.all([
    db.materials.bulkGet(data.materials.map((item) => item.id)),
    db.notes.bulkGet(data.notes.map((item) => item.id)),
    db.events.bulkGet(data.events.map((item) => item.id)),
    db.sessions.bulkGet(data.sessions.map((item) => item.id)),
  ]);
  const conflicts =
    existing.flat().filter(Boolean).length + (data.settings && (await db.settings.get('settings')) ? 1 : 0);
  return { data, conflicts, importable: ids.length + (data.settings ? 1 : 0) - conflicts };
}

export async function importData(data: ExportEnvelope): Promise<void> {
  await db.transaction('rw', db.materials, db.notes, db.settings, db.events, db.sessions, async () => {
    const [materials, notes, events, sessions, existingSettings] = await Promise.all([
      db.materials.bulkGet(data.materials.map((item) => item.id)),
      db.notes.bulkGet(data.notes.map((item) => item.id)),
      db.events.bulkGet(data.events.map((item) => item.id)),
      db.sessions.bulkGet(data.sessions.map((item) => item.id)),
      db.settings.get('settings'),
    ]);
    await db.materials.bulkAdd(data.materials.filter((_, index) => !materials[index]));
    await db.notes.bulkAdd(data.notes.filter((_, index) => !notes[index]));
    await db.events.bulkAdd(data.events.filter((_, index) => !events[index]));
    await db.sessions.bulkAdd(data.sessions.filter((_, index) => !sessions[index]));
    if (data.settings && !existingSettings) await db.settings.add(data.settings);
  });
}
