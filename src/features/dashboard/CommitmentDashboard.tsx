import { backlog, formatDuration } from '../../domain';
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
  const summary = backlog(materials, weekdayMinutes, weekendMinutes);
  const capacity =
    summary.capacity === null
      ? 'Not set'
      : summary.capacity === 0
        ? '0 min'
        : formatDuration(summary.capacity);
  return (
    <section aria-labelledby="overview-title" className="dashboard-section">
      <div>
        <p className="section-kicker">Your learning plan</p>
        <h2 id="overview-title" className="section-title">
          Commitment overview
        </h2>
        <p className="section-copy">A clear view of the time you have promised yourself.</p>
      </div>
      <div className="metrics-grid">
        {[
          ['Committed items', String(summary.active)],
          ['Estimated work', formatDuration(summary.known)],
          ['Need an estimate', String(summary.unknown)],
          ['Weekly capacity', capacity],
        ].map(([label, value]) => (
          <div key={label} className="metric-card">
            <p className="metric-card__label">{label}</p>
            <p className="metric-card__value">{value}</p>
          </div>
        ))}
      </div>
      <div className="planning-note">
        {summary.capacity === null || summary.capacity === 0 ? (
          <>
            <strong>Set your availability</strong> to see when your estimated queue fits.{' '}
            <button className="text-action" onClick={onAvailability}>
              Set time
            </button>
          </>
        ) : (
          <>
            <strong>Clearance estimate:</strong>{' '}
            {summary.clearanceWeeks === null ? 'Unavailable' : `${summary.clearanceWeeks.toFixed(1)} weeks`}{' '}
            for estimated items
            {summary.unknown
              ? `, plus ${summary.unknown} item${summary.unknown === 1 ? '' : 's'} without estimates`
              : ''}
            .{' '}
            {summary.known > summary.capacity * 4 && (
              <span className="font-semibold">Your queue is over four weeks of capacity.</span>
            )}
          </>
        )}{' '}
        {summary.active > 3 && (
          <span className="mt-2 block">
            Keep the active queue small: return lower-value items to Inbox or archive them until you have
            capacity.
          </span>
        )}
      </div>
    </section>
  );
}
