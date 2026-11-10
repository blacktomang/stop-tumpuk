import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { useEffect, useMemo, useState } from 'react';
import { estimatedSeconds, formatDuration, recommendMaterials } from '../../domain';
import {
  endSession,
  pauseSession,
  resumeSession,
  startSession,
  useActiveSession,
} from '../../repositories/session-repository';
import type { Material } from '../../types';

const focusSeconds = 25 * 60;

interface LearningWorkspaceProps {
  materials: Material[];
  onInProgress: (material: Material) => Promise<void>;
  onComplete: (material: Material) => Promise<void>;
  onNotes: (material: Material) => void;
}

export function LearningWorkspace({ materials, onInProgress, onComplete, onNotes }: LearningWorkspaceProps) {
  const [budgetMinutes, setBudgetMinutes] = useState(15);
  const [customBudget, setCustomBudget] = useState('');
  const [selected, setSelected] = useState<Material | null>(null);
  const [error, setError] = useState('');
  const active = materials.filter(
    (material) => material.status === 'queued' || material.status === 'in-progress',
  );
  const recommendation = useMemo(
    () => recommendMaterials(active, Math.max(0, budgetMinutes) * 60),
    [active, budgetMinutes],
  );

  function chooseBudget(minutes: number) {
    setBudgetMinutes(minutes);
    setCustomBudget('');
  }

  function applyCustomBudget(value: string) {
    setCustomBudget(value);
    const minutes = Number(value);
    if (Number.isFinite(minutes) && minutes >= 0) setBudgetMinutes(minutes);
  }

  async function begin(material: Material) {
    try {
      setError('');
      await onInProgress(material);
      setSelected({ ...material, status: 'in-progress' });
    } catch {
      setError('Your reading session could not be started. Please try again.');
    }
  }

  return (
    <section aria-labelledby="learn-title" className="learning-section">
      <div className="learning-section__heading">
        <div>
          <p className="section-kicker">Read next</p>
          <h2 id="learn-title" className="section-title">
            What fits right now?
          </h2>
          <p className="section-copy">Recommendations use your Estimated time.</p>
        </div>
      </div>
      <div className="budget-controls" aria-label="Time available now">
        <span className="budget-controls__label">I have</span>
        {[5, 15, 30].map((minutes) => (
          <button
            key={minutes}
            className={
              budgetMinutes === minutes && !customBudget
                ? 'budget-button budget-button--active'
                : 'budget-button'
            }
            onClick={() => chooseBudget(minutes)}
          >
            {minutes} min
          </button>
        ))}
        <label className="budget-custom">
          <span className="sr-only">Custom minutes available</span>
          <input
            min="0"
            inputMode="numeric"
            type="number"
            value={customBudget}
            onChange={(event) => applyCustomBudget(event.target.value)}
            placeholder="Custom"
          />
          <span>min</span>
        </label>
      </div>
      {error && (
        <p role="alert" className="status-error">
          {error}
        </p>
      )}
      {selected ? (
        <LearningView
          material={selected}
          onBack={() => setSelected(null)}
          onBegin={() => begin(selected)}
          onComplete={onComplete}
          onFinished={() => setSelected(null)}
          onNotes={onNotes}
        />
      ) : (
        <RecommendationList
          materials={active}
          primary={recommendation.primary}
          partial={recommendation.partial}
          manual={recommendation.manual}
          onChoose={setSelected}
        />
      )}
    </section>
  );
}

function RecommendationList({
  materials,
  primary,
  partial,
  manual,
  onChoose,
}: {
  materials: Material[];
  primary: Material | null;
  partial: Material | null;
  manual: Material[];
  onChoose: (material: Material) => void;
}) {
  if (!materials.length)
    return <p className="empty-state">Your Reading plan is clear. Add an Inbox item when you are ready.</p>;
  return (
    <div className="recommendation-panel">
      {primary ? (
        <>
          <p className="recommendation-panel__label">Read next · fits your time</p>
          <RecommendationRow material={primary} onChoose={onChoose} actionLabel="Open" />
        </>
      ) : (
        <p className="recommendation-panel__copy">
          Nothing with an Estimated time fits this window. Items without estimates are never claimed to fit.
        </p>
      )}
      {partial && (
        <div className="partial-option">
          <div>
            <p className="font-semibold text-(--ink)">Try part of a longer item</p>
            <p className="text-sm text-(--muted)">
              {partial.title} · {formatDuration(estimatedSeconds(partial))} estimated
            </p>
          </div>
          <button className="action" onClick={() => onChoose(partial)}>
            Open anyway
          </button>
        </div>
      )}
      <details className="manual-choice">
        <summary>Choose another</summary>
        <div className="manual-choice__list">
          {manual.map((material) => (
            <RecommendationRow key={material.id} material={material} onChoose={onChoose} />
          ))}
        </div>
      </details>
    </div>
  );
}

function RecommendationRow({
  material,
  onChoose,
  actionLabel = 'Select',
}: {
  material: Material;
  onChoose: (material: Material) => void;
  actionLabel?: string;
}) {
  return (
    <div className="recommendation-row">
      <div className="min-w-0">
        <p className="truncate font-semibold text-(--ink)">{material.title}</p>
        <p className="text-sm text-(--muted)">{formatDuration(estimatedSeconds(material))} Estimated time</p>
      </div>
      <button className="action" onClick={() => onChoose(material)}>
        {actionLabel}
      </button>
    </div>
  );
}

function LearningView({
  material,
  onBack,
  onBegin,
  onComplete,
  onFinished,
  onNotes,
}: {
  material: Material;
  onBack: () => void;
  onBegin: () => Promise<void>;
  onComplete: (material: Material) => Promise<void>;
  onFinished: () => void;
  onNotes: (material: Material) => void;
}) {
  const [error, setError] = useState('');
  async function complete() {
    try {
      setError('');
      await onComplete(material);
      onFinished();
    } catch {
      setError('Finishing was not saved. Please try again.');
    }
  }
  const inProgress = material.status === 'in-progress';
  return (
    <div className="learning-view">
      <button className="text-action" onClick={onBack}>
        ← Back to choices
      </button>
      <div className="learning-view__head">
        <div>
          <p className="section-kicker">Reading</p>
          <h3 className="modal-title">{material.title}</h3>
          <p className="modal-copy">
            {formatDuration(estimatedSeconds(material))} Estimated time · {material.domain}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {inProgress ? (
            <button className="primary-button" onClick={() => void complete()}>
              Finish
            </button>
          ) : (
            <a className="primary-button" href={material.originalUrl} target="_blank" rel="noreferrer">
              Open source ↗
            </a>
          )}
          <SessionOptions material={material} inProgress={inProgress} onBegin={onBegin} onNotes={onNotes} />
        </div>
      </div>
      {error && (
        <p role="alert" className="status-error">
          {error}
        </p>
      )}
      <FocusTimer material={material} onBegin={onBegin} />
      {inProgress && (
        <p className="text-sm text-(--muted)">
          Only Finish marks this material as Finished. A timer never does.
        </p>
      )}
    </div>
  );
}

function SessionOptions({
  material,
  inProgress,
  onBegin,
  onNotes,
}: {
  material: Material;
  inProgress: boolean;
  onBegin: () => Promise<void>;
  onNotes: (material: Material) => void;
}) {
  const itemClass =
    'block w-full px-3 py-2.5 text-left text-sm text-(--ink) data-focus:bg-(--surface-soft) data-focus:outline-none';
  return (
    <Menu>
      <MenuButton className="action" aria-label="Session options">
        Session options
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        className="z-30 mt-2 w-52 origin-top-right rounded-xl border border-(--line) bg-(--surface) p-1 shadow-lg outline-none"
      >
        {!inProgress && (
          <MenuItem>
            {({ close }) => (
              <button className={itemClass} onClick={() => (close(), void onBegin())}>
                Mark as in progress
              </button>
            )}
          </MenuItem>
        )}
        {inProgress && (
          <MenuItem>
            {({ close }) => (
              <a
                className={itemClass}
                href={material.originalUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => close()}
              >
                Open source
              </a>
            )}
          </MenuItem>
        )}
        <MenuItem>
          {({ close }) => (
            <button className={itemClass} onClick={() => (close(), onNotes(material))}>
              Notes
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

function FocusTimer({ material, onBegin }: { material: Material; onBegin: () => Promise<void> }) {
  const session = useActiveSession(material.id);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [showTimer, setShowTimer] = useState(false);
  useEffect(() => {
    if (session?.state !== 'running') return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [session?.state]);
  const elapsed = session
    ? session.elapsedSeconds +
      (session.state === 'running' ? Math.floor((now - Date.parse(session.stateChangedAt)) / 1000) : 0)
    : 0;
  const remaining = Math.max(0, focusSeconds - elapsed);
  useEffect(() => {
    if (session?.state === 'running' && remaining === 0) void endSession(session);
  }, [remaining, session]);
  useEffect(() => {
    if (session && session.state !== 'ended') setShowTimer(true);
  }, [session]);
  async function start() {
    try {
      setError('');
      await onBegin();
      await startSession(material.id);
    } catch {
      setError('The timer could not start. Please try again.');
    }
  }
  async function action() {
    if (!session) return start();
    try {
      setError('');
      if (session.state === 'running') await pauseSession(session);
      else await resumeSession(session);
    } catch {
      setError('The timer could not be updated. Please try again.');
    }
  }
  const timerControls = (
    <div className="focus-timer">
      <div>
        <p className="focus-timer__label">Optional 25-minute focus timer</p>
        <p className="focus-timer__time">
          {Math.floor(remaining / 60)
            .toString()
            .padStart(2, '0')}
          :{(remaining % 60).toString().padStart(2, '0')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {session?.state === 'ended' ? (
          <span className="self-center text-sm text-(--muted)">
            Interval ended — your material is still in progress.
          </span>
        ) : (
          <button className="action" onClick={() => void action()}>
            {session?.state === 'running' ? 'Pause' : session ? 'Resume' : 'Start timer'}
          </button>
        )}
        {session && session.state !== 'ended' && (
          <button className="action" onClick={() => void endSession(session)}>
            End timer
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
  if (session && session.state !== 'ended') return timerControls;
  return (
    <Disclosure as="div" className="rounded-2xl border border-(--line) bg-(--surface-soft)">
      <DisclosureButton
        className="flex min-h-12 w-full items-center justify-between gap-4 px-4 text-left text-sm font-semibold text-(--ink)"
        onClick={() => setShowTimer((current) => !current)}
      >
        <span>Optional 25-minute focus timer</span>
        <span aria-hidden="true">{showTimer ? '−' : '+'}</span>
      </DisclosureButton>
      {showTimer && (
        <DisclosurePanel static className="px-4 pb-4">
          {timerControls}
        </DisclosurePanel>
      )}
    </Disclosure>
  );
}
