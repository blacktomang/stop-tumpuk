import { useEffect, useState, type FormEvent } from 'react';
import { captureUrl, type CaptureDestination } from '../../application/capture-service';
import type { CaptureIntake } from '../../types';

interface CaptureFormProps {
  intake: CaptureIntake | null;
  onIntakeSaved: () => void;
}

export function CaptureForm({ intake, onIntakeSaved }: CaptureFormProps) {
  const [url, setUrl] = useState('');
  const [destination, setDestination] = useState<CaptureDestination>('queued');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!intake) return;
    setUrl(intake.url);
    setMessage('Shared link ready to save.');
  }, [intake]);

  async function capture(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      const captureOptions = intake ? { intakeId: intake.id, intakeTitle: intake.title } : undefined;
      let result = await captureUrl(url, destination, captureOptions);
      if (result.kind === 'duplicate') {
        if (!confirm(`This link is already saved as “${result.existing.title}”. Save another copy?`)) return;
        result = await result.retry();
      }
      if (result.kind !== 'saved') return;
      setUrl('');
      setDestination('queued');
      if (intake) onIntakeSaved();
      setMessage(
        result.material.status === 'queued'
          ? 'Saved to your Reading plan. Set an Estimated time when you are ready.'
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
        Reading plan is selected by default and adds an item to your Estimated time. Choose Inbox for a link
        you want to review later.
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
        <div className="capture-actions">
          <fieldset className="capture-destination rounded-r-none w-full">
            <legend className="sr-only">Save destination</legend>
            <label className="capture-destination__option">
              <input
                checked={destination === 'queued'}
                className="capture-destination__radio"
                name="capture-destination"
                onChange={() => setDestination('queued')}
                type="radio"
              />
              Reading plan
            </label>
            <label className="capture-destination__option">
              <input
                checked={destination === 'inbox'}
                className="capture-destination__radio"
                name="capture-destination"
                onChange={() => setDestination('inbox')}
                type="radio"
              />
              Inbox
            </label>
          </fieldset>
          <button className="primary-button rounded-l-none">Save</button>
        </div>
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
