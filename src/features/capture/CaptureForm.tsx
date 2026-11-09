import { useEffect, useState, type FormEvent } from 'react';
import { captureUrl } from '../../application/capture-service';

interface CaptureFormProps {
  intakeUrl: string | null;
}

export function CaptureForm({ intakeUrl }: CaptureFormProps) {
  const [url, setUrl] = useState('');
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
      const result = await captureUrl(url);
      if (result.kind === 'duplicate') {
        if (!confirm(`This link is already saved as “${result.existing.title}”. Save another copy?`)) return;
        await result.retry();
      }
      setUrl('');
      setMessage('Saved to Inbox. Add a time estimate when you are ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save that link.');
    }
  }
  return (
    <section aria-labelledby="capture-title" className="capture-panel">
      <p className="capture-panel__eyebrow">Capture without commitment</p>
      <h2 id="capture-title" className="capture-panel__title">
        Save the link. Decide later.
      </h2>
      <p className="capture-panel__copy">
        Put articles and videos in your Inbox first. They only become a commitment when you move them to your
        queue.
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
        <button className="primary-button">Save to Inbox</button>
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
