import { useEffect, useState, type FormEvent } from 'react';
import { captureUrl, type CaptureDestination } from '../../application/capture-service';

interface CaptureFormProps {
  intakeUrl: string | null;
}

export function CaptureForm({ intakeUrl }: CaptureFormProps) {
  const [url, setUrl] = useState('');
  const [destination, setDestination] = useState<CaptureDestination>('queued');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!intakeUrl) return;
    setUrl(intakeUrl);
    setMessage('Shared link ready to save.');
  }, [intakeUrl]);

  async function capture(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      let result = await captureUrl(url, destination);
      if (result.kind === 'duplicate') {
        if (!confirm(`This link is already saved as “${result.existing.title}”. Save another copy?`)) return;
        result = await result.retry();
      }
      if (result.kind !== 'saved') return;
      setUrl('');
      setDestination('queued');
      setMessage(
        result.material.status === 'queued'
          ? 'Saved to your Reading plan. Add an estimate when you are ready.'
          : 'Saved to Inbox. It is not part of your Reading plan yet.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save that link.');
    }
  }
  return (
    <section aria-labelledby="capture-title" className="capture-panel">
      <p className="capture-panel__eyebrow">Save with intent</p>
      <h2 id="capture-title" className="capture-panel__title">
        Save the link. Choose where it belongs.
      </h2>
      <p className="capture-panel__copy">
        Reading plan is selected by default and adds an item to your estimated reading time. Choose Inbox for
        a link you want to review later.
      </p>
      <form onSubmit={capture} className="capture-form">
        <label className="sr-only" htmlFor="url">
          Article or video URL
        </label>
        <input
          id="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="capture-input"
          placeholder="Paste an article or video link"
          inputMode="url"
        />
        <button className="primary-button">
          Save to {destination === 'queued' ? 'Reading plan' : 'Inbox'}
        </button>
        <fieldset className="flex flex-wrap gap-2 sm:contents">
          <legend className="sr-only">Save destination</legend>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-500 bg-slate-800 px-3 text-sm font-medium text-white has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-900">
            <input
              checked={destination === 'queued'}
              className="size-4 accent-emerald-400"
              name="capture-destination"
              onChange={() => setDestination('queued')}
              type="radio"
            />
            Reading plan
          </label>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-500 bg-slate-800 px-3 text-sm font-medium text-white has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-900">
            <input
              checked={destination === 'inbox'}
              className="size-4 accent-emerald-400"
              name="capture-destination"
              onChange={() => setDestination('inbox')}
              type="radio"
            />
            Inbox
          </label>
        </fieldset>
      </form>
      {message && (
        <p role="status" className="capture-status">
          {message}
        </p>
      )}
      <p className="capture-note">
        Paste always works. Sharing to this app depends on your installed browser and device.
      </p>
    </section>
  );
}
