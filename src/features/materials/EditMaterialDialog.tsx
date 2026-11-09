import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState, type FormEvent } from 'react';
import { saveMaterialDraft } from '../../application/material-service';
import { formatDuration, wordCount } from '../../domain';
import { field } from '../../shared/ui/classes';
import type { Completeness, DurationSource, Material, MaterialDraft, MaterialType } from '../../types';

const defaultDraft = (material: Material): MaterialDraft => ({
  title: material.title,
  type: material.type,
  priority: material.priority,
  contentSeconds: material.contentSeconds,
  durationSource: material.durationSource,
  completeness: material.completeness,
  wordCount: material.wordCount,
  playbackSpeed: material.playbackSpeed,
  effortMultiplier: material.effortMultiplier,
  manualEffortSeconds: material.manualEffortSeconds,
});

export function EditMaterialDialog({
  material,
  readingWpm,
  onClose,
}: {
  material: Material | null;
  readingWpm: number;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<MaterialDraft | null>(null);
  const [text, setText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceError, setSourceError] = useState('');
  useEffect(() => {
    setDraft(material ? defaultDraft(material) : null);
    setText('');
    setSourceUrl(material?.originalUrl ?? '');
    setSourceError('');
  }, [material]);
  if (!material || !draft) return null;
  const selectedMaterial = material;
  const selectedDraft = draft;
  const patch = <K extends keyof MaterialDraft>(key: K, value: MaterialDraft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  const calculateWords = () => {
    const count = wordCount(text);
    if (!count) {
      setSourceError('Paste some article text before calculating an estimate.');
      return;
    }
    setSourceError('');
    patch('wordCount', count);
    patch('contentSeconds', Math.ceil((count / readingWpm) * 60));
    patch('durationSource', 'word-count');
    patch('completeness', 'full');
  };
  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await saveMaterialDraft(selectedMaterial, selectedDraft, sourceUrl);
      onClose();
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : 'Enter a valid HTTP(S) source URL.');
    }
  }
  const estimate =
    draft.manualEffortSeconds ??
    (draft.contentSeconds === null
      ? null
      : Math.round((draft.contentSeconds / draft.playbackSpeed) * draft.effortMultiplier));
  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="modal-panel max-w-xl">
            <DialogTitle className="modal-title">Edit material</DialogTitle>
            <p className="modal-copy">
              Correct the source or tune the estimate to match the time this material actually needs.
            </p>
            <form className="mt-4 space-y-4" onSubmit={save}>
              <label className="block text-sm font-medium">
                Source URL
                <input
                  className={field}
                  type="url"
                  required
                  value={sourceUrl}
                  onChange={(event) => {
                    setSourceUrl(event.target.value);
                    setSourceError('');
                  }}
                />
              </label>
              {sourceError && (
                <p role="alert" className="text-sm text-rose-700">
                  {sourceError}
                </p>
              )}
              <label className="block text-sm font-medium">
                Title
                <input
                  className={field}
                  value={draft.title}
                  onChange={(event) => patch('title', event.target.value)}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {draft.type === 'video' && (
                  <label className="text-sm font-medium">
                    Playback speed
                    <select
                      className={field}
                      value={draft.playbackSpeed}
                      onChange={(event) => patch('playbackSpeed', Number(event.target.value))}
                    >
                      <option value={0.75}>0.75×</option>
                      <option value={1}>1.0×</option>
                      <option value={1.25}>1.25×</option>
                      <option value={1.5}>1.5×</option>
                      <option value={2}>2.0×</option>
                    </select>
                  </label>
                )}
                <label className="text-sm font-medium">
                  Type
                  <select
                    className={field}
                    value={draft.type}
                    onChange={(event) => patch('type', event.target.value as MaterialType)}
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Priority
                  <select
                    className={field}
                    value={draft.priority}
                    onChange={(event) => patch('priority', Number(event.target.value) as 1 | 2 | 3)}
                  >
                    <option value={1}>P1 high</option>
                    <option value={2}>P2 normal</option>
                    <option value={3}>P3 low</option>
                  </select>
                </label>
              </div>
              <div className="form-panel">
                <p className="text-sm font-semibold">Content duration</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    Minutes
                    <input
                      className={field}
                      type="number"
                      min="0"
                      value={draft.contentSeconds === null ? '' : Math.round(draft.contentSeconds / 60)}
                      onChange={(event) => {
                        const contentSeconds =
                          event.target.value === '' ? null : Number(event.target.value) * 60;
                        patch('contentSeconds', contentSeconds);
                        if (contentSeconds !== null) patch('durationSource', 'manual');
                      }}
                    />
                  </label>
                  <label className="text-sm">
                    Source
                    <select
                      className={field}
                      value={draft.durationSource}
                      onChange={(event) => patch('durationSource', event.target.value as DurationSource)}
                    >
                      <option value="unknown">Unknown</option>
                      <option value="api-runtime">API runtime</option>
                      <option value="publisher-estimate">Publisher estimate</option>
                      <option value="word-count">Calculated word count</option>
                      <option value="manual">Manual</option>
                    </select>
                  </label>
                </div>
                <label className="mt-3 block text-sm">
                  Completeness
                  <select
                    className={field}
                    value={draft.completeness}
                    onChange={(event) => patch('completeness', event.target.value as Completeness)}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="full">Full content</option>
                    <option value="partial">Preview / partial</option>
                  </select>
                </label>
              </div>
              {draft.type === 'article' && (
                <div className="form-panel bg-white">
                  <label className="block text-sm font-medium">
                    Paste complete article text to estimate locally
                    <textarea
                      className={field}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      rows={3}
                      placeholder="Not stored after you save."
                    />
                  </label>
                  <button type="button" className="action mt-2" onClick={calculateWords}>
                    Count words and estimate
                  </button>
                  {draft.wordCount !== null && (
                    <span className="ml-2 text-sm text-slate-600">{draft.wordCount} words</span>
                  )}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Learning multiplier
                  <select
                    className={field}
                    value={draft.effortMultiplier}
                    onChange={(event) => patch('effortMultiplier', Number(event.target.value))}
                  >
                    <option value={1}>1.0× light</option>
                    <option value={1.5}>1.5× focused</option>
                    <option value={2}>2.0× practice</option>
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Manual total effort (minutes)
                  <input
                    className={field}
                    type="number"
                    min="0"
                    value={
                      draft.manualEffortSeconds === null ? '' : Math.round(draft.manualEffortSeconds / 60)
                    }
                    onChange={(event) =>
                      patch(
                        'manualEffortSeconds',
                        event.target.value === '' ? null : Number(event.target.value) * 60,
                      )
                    }
                  />
                </label>
              </div>
              <p className="text-sm text-slate-600">
                Estimated learning effort: <strong>{formatDuration(estimate)}</strong>
              </p>
              <div className="flex justify-end gap-2">
                <button type="button" className="action" onClick={onClose}>
                  Cancel
                </button>
                <button className="primary-button min-h-10 px-4 py-2">Save changes</button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
