import Dexie, { type Table } from 'dexie';
import { databaseName, databaseSchemaVersion } from './db-identity';
import type { CaptureIntake, LearningSession, Material, MaterialEvent, Note, Settings } from './types';

/** The one-time Milestone 1 replacement identity; do not change after first release. */
export { databaseName, databaseSchemaVersion } from './db-identity';

export class CommitmentDb extends Dexie {
  materials!: Table<Material, string>;
  settings!: Table<Settings, 'settings'>;
  events!: Table<MaterialEvent, string>;
  notes!: Table<Note, string>;
  sessions!: Table<LearningSession, string>;
  captureIntake!: Table<CaptureIntake, string>;

  constructor(name = databaseName) {
    super(name);
    this.version(databaseSchemaVersion).stores({
      materials: 'id, normalizedUrl, status, updatedAt',
      settings: 'id',
      events: 'id, materialId, type, at',
      notes: 'id, materialId, updatedAt',
      sessions: 'id, materialId, stateChangedAt',
      captureIntake: 'id, receivedAt',
    });
  }
}

export const db = new CommitmentDb();
