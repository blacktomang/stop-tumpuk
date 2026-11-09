import Dexie, { type Table } from 'dexie';
import type { CaptureIntake, Material, MaterialEvent, Settings } from './types';

const databaseName = 'stop-tumpuk';

function reminderInThreeMonths(): string {
  const reminder = new Date();
  const day = reminder.getDate();
  reminder.setDate(1);
  reminder.setMonth(reminder.getMonth() + 3);
  const lastDayOfTargetMonth = new Date(reminder.getFullYear(), reminder.getMonth() + 1, 0).getDate();
  reminder.setDate(Math.min(day, lastDayOfTargetMonth));
  return reminder.toISOString();
}

export class CommitmentDb extends Dexie {
  materials!: Table<Material, string>;
  settings!: Table<Settings, 'settings'>;
  events!: Table<MaterialEvent, string>;
  captureIntake!: Table<CaptureIntake, string>;
  constructor() {
    super(databaseName);
    this.version(1).stores({
      materials: 'id, normalizedUrl, status, updatedAt',
      settings: 'id',
      events: 'id, materialId, type, at',
    });
    this.version(2).stores({
      materials: 'id, normalizedUrl, status, updatedAt',
      settings: 'id',
      events: 'id, materialId, type, at',
      captureIntake: 'id, receivedAt',
    });
    this.version(3)
      .stores({
        materials: 'id, normalizedUrl, status, updatedAt',
        settings: 'id',
        events: 'id, materialId, type, at',
        captureIntake: 'id, receivedAt',
      })
      .upgrade(async (transaction) => {
        const settings = await transaction.table('settings').get('settings');
        if (settings && !('availabilityReminderAt' in settings)) {
          await transaction.table('settings').update('settings', {
            availabilityReminderAt: settings.onboardingDismissed ? reminderInThreeMonths() : null,
          });
        }
      });
  }
}
export const db = new CommitmentDb();
