import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useRef, useState, type RefObject } from 'react';
import { exportData, importData, previewImport, type ImportPreview } from '../../application/data-transfer';

export function DataDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function download() {
    try {
      setBusy(true);
      setError('');
      const data = await exportData();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `stop-tumpuk-export-${data.exportedAt.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Your export could not be created. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function choose(file: File | undefined) {
    if (!file) return;
    try {
      setBusy(true);
      setError('');
      setPreview(await previewImport(await file.text()));
    } catch (reason) {
      setPreview(null);
      setError(reason instanceof Error ? reason.message : 'That file could not be imported.');
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    if (!preview) return;
    try {
      setBusy(true);
      setError('');
      await importData(preview.data);
      setPreview(null);
      if (input.current) input.current.value = '';
    } catch {
      setError('Nothing was imported because the data could not be saved safely.');
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setPreview(null);
    setError('');
    onClose();
  }

  function cancelPreview() {
    setPreview(null);
    if (input.current) input.current.value = '';
  }

  return (
    <Dialog open={open} onClose={close} className="relative z-20">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="modal-panel max-w-xl">
            {preview ? (
              <ImportPreviewStep
                busy={busy}
                preview={preview}
                onCancel={cancelPreview}
                onImport={() => void apply()}
              />
            ) : (
              <DataChooser
                busy={busy}
                error={error}
                input={input}
                onDownload={() => void download()}
                onChoose={choose}
              />
            )}
            <div className="mt-5 flex justify-end">
              <button className="action" onClick={close}>
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

function DataChooser({
  busy,
  error,
  input,
  onDownload,
  onChoose,
}: {
  busy: boolean;
  error: string;
  input: RefObject<HTMLInputElement | null>;
  onDownload: () => void;
  onChoose: (file: File | undefined) => Promise<void>;
}) {
  return (
    <>
      <p className="section-kicker">Local data</p>
      <DialogTitle className="modal-title">Back up or move your library</DialogTitle>
      <p className="modal-copy">
        Your data stays in this browser profile. Clearing browser data or using another device will not carry
        it over automatically. Export a file to keep a backup or transfer it manually.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-rose-700">
          {error}
        </p>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="form-panel">
          <p className="font-semibold">Export</p>
          <p className="mt-1 text-sm text-(--muted)">
            Download materials, notes, settings, sessions, and history.
          </p>
          <button className="primary-button mt-4 min-h-10 px-4 py-2" disabled={busy} onClick={onDownload}>
            Download export
          </button>
        </div>
        <div className="form-panel">
          <p className="font-semibold">Import</p>
          <p className="mt-1 text-sm text-(--muted)">
            Adds valid new records only. Existing matching IDs are never overwritten.
          </p>
          <label className="mt-4 block text-sm font-medium" htmlFor="import-file">
            Select an export file
          </label>
          <input
            ref={input}
            id="import-file"
            className="mt-2 block w-full text-sm"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void onChoose(event.target.files?.[0])}
          />
        </div>
      </div>
    </>
  );
}

function ImportPreviewStep({
  busy,
  preview,
  onCancel,
  onImport,
}: {
  busy: boolean;
  preview: ImportPreview;
  onCancel: () => void;
  onImport: () => void;
}) {
  return (
    <>
      <p className="section-kicker">Import data</p>
      <DialogTitle className="modal-title">Review import</DialogTitle>
      <p className="modal-copy">Review the valid records before adding them to this browser.</p>
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Import preview</p>
        <p className="mt-1">
          {preview.importable} new record{preview.importable === 1 ? '' : 's'} will be added.{' '}
          {preview.conflicts
            ? `${preview.conflicts} matching record${preview.conflicts === 1 ? '' : 's'} will be skipped without overwriting local data.`
            : 'No matching IDs found.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button className="action" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button min-h-10 px-4 py-2" disabled={busy} onClick={onImport}>
            Import new records
          </button>
        </div>
      </div>
    </>
  );
}
