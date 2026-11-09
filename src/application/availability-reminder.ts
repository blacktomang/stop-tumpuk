import type { Settings } from '../types';

const reminderMonths = 3;

export function nextAvailabilityReminder(from = new Date()): string {
  const reminder = new Date(from);
  const day = reminder.getDate();
  reminder.setDate(1);
  reminder.setMonth(reminder.getMonth() + reminderMonths);
  const lastDayOfTargetMonth = new Date(reminder.getFullYear(), reminder.getMonth() + 1, 0).getDate();
  reminder.setDate(Math.min(day, lastDayOfTargetMonth));
  return reminder.toISOString();
}

export function shouldPromptForAvailability(settings: Settings, now = new Date()): boolean {
  if (settings.weekdayMinutes !== null && settings.weekendMinutes !== null) return false;
  if (!settings.onboardingDismissed) return true;
  if (!settings.availabilityReminderAt) return false;
  const reminderAt = new Date(settings.availabilityReminderAt);
  return Number.isNaN(reminderAt.valueOf()) || reminderAt <= now;
}
