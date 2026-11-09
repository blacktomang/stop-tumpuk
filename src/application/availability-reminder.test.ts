import { describe, expect, it } from 'vitest';
import { emptySettings } from '../repositories/settings-repository';
import { nextAvailabilityReminder, shouldPromptForAvailability } from './availability-reminder';

describe('availability reminders', () => {
  it('schedules a skipped availability prompt three calendar months later', () => {
    expect(nextAvailabilityReminder(new Date('2026-01-31T10:00:00.000Z'))).toBe('2026-04-30T10:00:00.000Z');
  });

  it('does not prompt again until the stored reminder date', () => {
    const settings = {
      ...emptySettings,
      onboardingDismissed: true,
      availabilityReminderAt: '2026-05-06T00:00:00.000Z',
    };
    expect(shouldPromptForAvailability(settings, new Date('2026-05-05T23:59:59.000Z'))).toBe(false);
    expect(shouldPromptForAvailability(settings, new Date('2026-05-06T00:00:00.000Z'))).toBe(true);
  });

  it('never prompts after availability is configured', () => {
    expect(
      shouldPromptForAvailability(
        { ...emptySettings, weekdayMinutes: 30, weekendMinutes: 60 },
        new Date('2030-01-01T00:00:00.000Z'),
      ),
    ).toBe(false);
  });
});
