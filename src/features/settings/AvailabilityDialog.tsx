import { Dialog, DialogPanel, DialogTitle, Switch } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { SubmitEvent, useEffect, useId, useState, type ReactNode } from 'react';
import { field } from '../../shared/ui/classes';
import type { Settings } from '../../types';

const hours = Array.from({ length: 25 }, (_, hour) => hour);
const minutes = Array.from({ length: 60 }, (_, minute) => minute);

interface AvailabilityDialogProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => Promise<void>;
}

export function AvailabilityDialog({ open, settings, onClose, onSave }: AvailabilityDialogProps) {
  const [enabled, setEnabled] = useState(
    settings.weekdayMinutes !== null || settings.weekendMinutes !== null,
  );
  const [weekday, setWeekday] = useState(settings.weekdayMinutes ?? 0);
  const [weekend, setWeekend] = useState(settings.weekendMinutes ?? 0);
  useEffect(() => {
    setEnabled(settings.weekdayMinutes !== null || settings.weekendMinutes !== null);
    setWeekday(settings.weekdayMinutes ?? 0);
    setWeekend(settings.weekendMinutes ?? 0);
  }, [settings, open]);
  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave({
      ...settings,
      weekdayMinutes: enabled ? Math.max(0, weekday) : null,
      weekendMinutes: enabled ? Math.max(0, weekend) : null,
    });
  }
  return (
    <Dialog open={open} onClose={onClose} className="relative z-30">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="modal-panel max-w-md">
            <DialogTitle className="modal-title">Learning availability</DialogTitle>
            <form onSubmit={save} className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  Plan weekly learning time
                  <InfoTip>
                    Optional. It lets stop-tumpuk show whether your Reading plan fits your week.
                  </InfoTip>
                </span>
                <Switch
                  checked={enabled}
                  onChange={setEnabled}
                  className={`${enabled ? 'bg-emerald-700' : 'bg-slate-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span className="sr-only">Enable weekly availability</span>
                  <span
                    className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
              {enabled && (
                <div className="space-y-3">
                  <p id="availability-help" className="text-sm text-slate-600">
                    Set the time you usually have on each day. Choose 0 hours and 0 minutes for no available
                    learning time.
                  </p>
                  <DailyAvailabilitySelect label="Weekdays" value={weekday} onChange={setWeekday} />
                  <DailyAvailabilitySelect label="Weekends" value={weekend} onChange={setWeekend} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" className="action" onClick={onClose}>
                  Skip for 3 months
                </button>
                <InfoTip>
                  Skipping keeps your capacity unset. You can still set it anytime from the plan overview.
                </InfoTip>
                <button className="primary-button min-h-10 px-4 py-2">Save</button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

function InfoTip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="More information"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-(--line) text-(--muted) transition hover:border-(--accent) hover:text-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2"
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <InformationCircleIcon aria-hidden="true" className="h-4 w-4" />
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-(--ink) px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg"
        >
          {children}
        </span>
      )}
    </span>
  );
}

function DailyAvailabilitySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
}) {
  const selectedHours = Math.floor(value / 60);
  const selectedMinutes = value % 60;
  const updateHours = (nextHours: number) => onChange(nextHours * 60 + selectedMinutes);
  const updateMinutes = (nextMinutes: number) => onChange(selectedHours * 60 + nextMinutes);

  return (
    <fieldset aria-describedby="availability-help" className="rounded-xl border border-slate-200 p-3">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        {label} <span className="font-normal text-slate-500">(per day)</span>
      </legend>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label className="text-sm font-medium text-slate-700">
          Hours
          <select
            className={field}
            value={selectedHours}
            onChange={(event) => updateHours(Number(event.target.value))}
          >
            {hours.map((hour) => (
              <option key={hour} value={hour}>
                {hour} {hour === 1 ? 'hour' : 'hours'}
              </option>
            ))}
          </select>
        </label>
        <span aria-hidden="true" className="pb-2 text-xl font-semibold text-slate-400">
          :
        </span>
        <label className="text-sm font-medium text-slate-700">
          Minutes
          <select
            className={field}
            value={selectedMinutes}
            onChange={(event) => updateMinutes(Number(event.target.value))}
          >
            {minutes.map((minute) => (
              <option key={minute} value={minute}>
                {minute} {minute === 1 ? 'minute' : 'minutes'}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}
