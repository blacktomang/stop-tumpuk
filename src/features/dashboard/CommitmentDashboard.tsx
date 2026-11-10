import { capacityViewModel, roundMinutes } from '../../domain';
import type { Material } from '../../types';

interface CommitmentDashboardProps {
  materials: Material[];
  weekdayMinutes: number | null;
  weekendMinutes: number | null;
  onAvailability: () => void;
}

export function CommitmentDashboard({
  materials,
  weekdayMinutes,
  weekendMinutes,
  onAvailability,
}: CommitmentDashboardProps) {
  const capacity = capacityViewModel(materials, weekdayMinutes, weekendMinutes);
  const plannedMinutes = roundMinutes(capacity.plannedSeconds);
  const availableMinutes = capacity.capacitySeconds === null ? null : roundMinutes(capacity.capacitySeconds);
  const unknownCopy = capacity.unknownCount
    ? ` + ${capacity.unknownCount} item${capacity.unknownCount === 1 ? '' : 's'} without estimates`
    : '';
  const meterText =
    capacity.state === 'overflow'
      ? `${plannedMinutes} / ${availableMinutes} minutes — ${roundMinutes(capacity.overflowSeconds ?? 0)} minutes beyond your weekly allowance`
      : `${plannedMinutes} of ${availableMinutes} minutes available this week`;
  return (
    <section aria-labelledby="overview-title" className="dashboard-section">
      <div>
        <p className="section-kicker">Your Reading plan</p>
        <h2 id="overview-title" className="section-title">
          Time available this week
        </h2>
        <p className="section-copy">Your plan is compared with one week of the time you have set aside.</p>
      </div>
      <div className="capacity-card">
        {capacity.state === 'unset' ? (
          <p className="capacity-card__message">
            Set weekday and weekend time to compare your Reading plan with one week of availability.{' '}
            <button className="text-action" onClick={onAvailability}>
              Set time
            </button>
          </p>
        ) : capacity.state === 'zero' ? (
          <p className="capacity-card__message">
            No time is allocated this week. Your Reading plan has {plannedMinutes} minutes estimated
            {unknownCopy}.
          </p>
        ) : (
          <>
            <p className="capacity-card__message">
              {capacity.state === 'empty'
                ? 'Your Reading plan is empty.'
                : `You've planned ${plannedMinutes} minutes of reading${unknownCopy}.`}
            </p>
            <div
              aria-label="Reading plan capacity"
              aria-valuemax={availableMinutes ?? undefined}
              aria-valuemin={0}
              aria-valuenow={Math.min(plannedMinutes, availableMinutes ?? 0)}
              aria-valuetext={meterText}
              className={`capacity-meter capacity-meter--${capacity.state}`}
              role="meter"
            >
              <div className="capacity-meter__track" aria-hidden="true">
                <div
                  className="capacity-meter__fill"
                  style={{ width: `${(capacity.visualFraction ?? 0) * 100}%` }}
                />
              </div>
              <p className="capacity-meter__label">{meterText}</p>
            </div>
            <p className="capacity-card__detail">
              {capacity.state === 'under' && capacity.headroomSeconds !== null
                ? `You have room for about another ${roundMinutes(capacity.headroomSeconds)} minutes.`
                : capacity.state === 'full'
                  ? 'Your estimated Reading plan fills your weekly allowance.'
                  : capacity.state === 'overflow'
                    ? 'The bar is capped for display; the text shows the full amount.'
                    : 'Add a material to start planning your reading time.'}
              {capacity.clearanceWeeks !== null &&
                capacity.clearanceWeeks > 0 &&
                capacity.state !== 'empty' && (
                  <span>
                    {' '}
                    About {capacity.clearanceWeeks.toFixed(1)} week{capacity.clearanceWeeks === 1 ? '' : 's'}{' '}
                    at your current schedule, assuming no new items and that you follow your allowance.
                  </span>
                )}
              {capacity.unknownCount > 0 && (
                <span> Items without estimates are not included in the bar, headroom, or projection.</span>
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
