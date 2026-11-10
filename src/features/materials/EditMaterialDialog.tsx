import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { useEffect, useState, type FormEvent } from 'react';
import { saveMaterialDraft } from '../../application/material-service';
import { estimateLabel, estimatedSeconds, formatDuration } from '../../domain';
import { field } from '../../shared/ui/classes';
import type { Material, MaterialDraft, MaterialType } from '../../types';

const defaultDraft = (material: Material): MaterialDraft => ({
  title: material.title,
  type: material.type,
  sourceDurationSeconds: material.sourceDurationSeconds,
  sourceDurationProvenance: material.sourceDurationProvenance,
  sourceDurationCompleteness: material.sourceDurationCompleteness,
  playbackSpeed: material.playbackSpeed,
  manualEstimatedSeconds: material.manualEstimatedSeconds,
});

export function EditMaterialDialog({
  material,
  onClose,
}: {
  material: Material | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<MaterialDraft | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceError, setSourceError] = useState('');
  useEffect(() => {
    setDraft(material ? defaultDraft(material) : null);
    setSourceUrl(material?.originalUrl ?? '');
    setSourceError('');
  }, [material]);
  if (!material || !draft) return null;

  const selectedMaterial = material;
  const selectedDraft = draft;

  const patch = <K extends keyof MaterialDraft>(key: K, value: MaterialDraft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  const preview: Material = { ...selectedMaterial, ...selectedDraft };

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await saveMaterialDraft(selectedMaterial, selectedDraft, sourceUrl);
      onClose();
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : 'Enter a valid HTTP(S) source URL.');
    }
  }

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="modal-panel max-w-xl">
            <DialogTitle className="modal-title">Edit material</DialogTitle>
            <p className="modal-copy">Correct the source and set one planning estimate when you need to.</p>
            <form className="mt-4 space-y-4" onSubmit={save}>
              <label className="block text-sm font-medium">
                Source URL
                <input
                  className={field}
                  type="url"
                  required
                  autoFocus
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
              <label className="block text-sm font-medium">
                Estimated time (minutes)
                <input
                  className={field}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    draft.manualEstimatedSeconds === null ? '' : Math.round(draft.manualEstimatedSeconds / 60)
                  }
                  onChange={(event) =>
                    patch(
                      'manualEstimatedSeconds',
                      event.target.value === '' ? null : Number(event.target.value) * 60,
                    )
                  }
                />
                <span className="mt-1 block text-xs font-normal text-(--muted)">
                  Leave blank to use the available source estimate. Zero is allowed when intentional.
                </span>
              </label>
              <p className="rounded-xl bg-(--surface-soft) px-4 py-3 text-sm text-(--muted)">
                {estimateLabel(preview)}:{' '}
                <strong className="text-(--ink)">{formatDuration(estimatedSeconds(preview))}</strong>
              </p>
              <Disclosure as="div" className="form-panel">
                <DisclosureButton className="w-full text-left text-sm font-semibold text-(--ink)">
                  Advanced source details
                </DisclosureButton>
                <DisclosurePanel className="mt-3 grid gap-3 sm:grid-cols-2">
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
                </DisclosurePanel>
              </Disclosure>
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
