import { useEffect, useMemo, useState } from 'react';
import { estimatedSeconds, formatDuration, recommendMaterials } from '../../domain';
import { createNote } from '../../repositories/note-repository';
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
      setError('Your learning session could not be started. Please try again.');
    }
  }

  return (
    <section aria-labelledby="learn-title" className="learning-section">
      <div className="learning-section__heading">
        <div>
          <p className="section-kicker">Make the next session count</p>
          <h2 id="learn-title" className="section-title">
            What fits right now?
          </h2>
          <p className="section-copy">Recommendations use your estimated learning effort, not raw runtime.</p>
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
          onNotes={onNotes}
        />
      ) : (
        <RecommendationList
          materials={active}
          fitting={recommendation.fitting}
          partial={recommendation.partial}
          onChoose={setSelected}
        />
      )}
    </section>
  );
}

function RecommendationList({
  materials,
  fitting,
  partial,
  onChoose,
}: {
  materials: Material[];
  fitting: Material[];
  partial: Material | null;
  onChoose: (material: Material) => void;
}) {
  if (!materials.length)
    return <p className="empty-state">Commit an Inbox item to choose your next learning session.</p>;
  return (
    <div className="recommendation-panel">
      {fitting.length ? (
        <>
          <p className="recommendation-panel__label">Fits your time</p>
          {fitting.slice(0, 3).map((material) => (
            <RecommendationRow key={material.id} material={material} onChoose={onChoose} />
          ))}
        </>
      ) : (
        <p className="recommendation-panel__copy">Nothing estimated fits this window.</p>
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
        <summary>Choose another material manually</summary>
        <div className="manual-choice__list">
          {materials.map((material) => (
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
}: {
  material: Material;
  onChoose: (material: Material) => void;
}) {
  return (
    <div className="recommendation-row">
      <div className="min-w-0">
        <p className="truncate font-semibold text-(--ink)">{material.title}</p>
        <p className="text-sm text-(--muted)">{formatDuration(estimatedSeconds(material))} estimated time</p>
      </div>
      <button className="action" onClick={() => onChoose(material)}>
        Select
      </button>
    </div>
  );
}

function LearningView({
  material,
  onBack,
  onBegin,
  onComplete,
  onNotes,
}: {
  material: Material;
  onBack: () => void;
  onBegin: () => Promise<void>;
  onComplete: (material: Material) => Promise<void>;
  onNotes: (material: Material) => void;
}) {
  const [showCompletion, setShowCompletion] = useState(false);
  const [error, setError] = useState('');
  async function complete() {
    try {
      setError('');
      await onComplete(material);
      setShowCompletion(true);
    } catch {
      setError('Completion was not saved. Please try again.');
    }
  }
  return (
    <div className="learning-view">
      <button className="text-action" onClick={onBack}>
        ← Back to choices
      </button>
      <div className="learning-view__head">
        <div>
          <p className="section-kicker">Learning session</p>
          <h3 className="modal-title">{material.title}</h3>
          <p className="modal-copy">
            {formatDuration(estimatedSeconds(material))} estimated time · {material.domain}
          </p>
        </div>
        <a className="primary-button" href={material.originalUrl} target="_blank" rel="noreferrer">
          Open source ↗
        </a>
      </div>
      {error && (
        <p role="alert" className="status-error">
          {error}
        </p>
      )}
      {material.status !== 'in-progress' && (
        <button className="action" onClick={() => void onBegin()}>
          Start learning
        </button>
      )}
      <FocusTimer material={material} onBegin={onBegin} />
      <button className="action" onClick={() => onNotes(material)}>
        View notes
      </button>
      <div className="learning-view__complete">
        <div>
          <p className="font-semibold text-(--ink)">Finished with this material?</p>
          <p className="text-sm text-(--muted)">Only this button marks it complete. A timer never does.</p>
        </div>
        <button className="primary-button" onClick={() => void complete()}>
          Complete
        </button>
      </div>
      {showCompletion && <TakeawayPrompt material={material} onClose={onBack} />}
    </div>
  );
}

function FocusTimer({ material, onBegin }: { material: Material; onBegin: () => Promise<void> }) {
  const session = useActiveSession(material.id);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
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
  return (
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
}

function TakeawayPrompt({ material, onClose }: { material: Material; onClose: () => void }) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    if (!content.trim()) return onClose();
    try {
      setSaving(true);
      setError('');
      await createNote(material.id, content);
      onClose();
    } catch {
      setError('Your completion is saved, but the takeaway was not. Please retry or skip it.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="takeaway-title"
        className="modal-panel max-w-lg"
      >
        <p className="section-kicker">Nice work</p>
        <h3 id="takeaway-title" className="modal-title">
          Save a takeaway?
        </h3>
        <p className="modal-copy">
          Optional and kept with this source. You can skip it without changing completion.
        </p>
        <textarea
          className="takeaway-input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What do you want to remember?"
          rows={4}
        />
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button className="action" onClick={onClose}>
            Skip
          </button>
          <button className="primary-button" disabled={saving} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save takeaway'}
          </button>
        </div>
      </section>
    </div>
  );
}
