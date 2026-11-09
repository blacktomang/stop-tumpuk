import { saveSettings as persistSettings } from '../repositories/settings-repository';
import type { Settings } from '../types';

export async function saveSettings(settings: Settings): Promise<void> {
  await persistSettings(settings);
}
