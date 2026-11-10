import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Settings } from '../types';

export const emptySettings: Settings = {
  id: 'settings',
  weekdayMinutes: null,
  weekendMinutes: null,
  onboardingDismissed: false,
  availabilityReminderAt: null,
};

export function useSettings(): Settings {
  const storedSettings = useLiveQuery(() => db.settings.get('settings'), []);
  return storedSettings ? { ...emptySettings, ...storedSettings } : emptySettings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await db.settings.put(settings);
}
