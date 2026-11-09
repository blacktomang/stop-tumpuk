import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { createNote, deleteNote, updateNote, useNotes } from '../../repositories/note-repository';
import { field } from '../../shared/ui/classes';
import type { Material, Note } from '../../types';

export function NotesDialog({ material, onClose }: { material: Material | null; onClose: () => void }) {
  const notes = useNotes(material?.id ?? '');
  const [editing, setEditing] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditing(null);
    setContent('');
    setError('');
  }, [material]);

  if (!material) return null;
  const selectedMaterial = material;

  function startEditing(note?: Note) {
    setEditing(
      note ??
        ({ id: '', materialId: selectedMaterial.id, content: '', createdAt: '', updatedAt: '' } as Note),
    );
    setContent(note?.content ?? '');
    setError('');
  }

  async function save() {
    if (!editing) return;
    try {
      setSaving(true);
      setError('');
      if (editing.id) await updateNote(editing, content);
      else await createNote(selectedMaterial.id, content);
      setEditing(null);
      setContent('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The note was not saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(note: Note) {
    if (!confirm('Delete this note?')) return;
    try {
      setError('');
      await deleteNote(note);
    } catch {
      setError('The note was not deleted. Please try again.');
    }
  }

  return (
    <Dialog open onClose={onClose} className="relative z-20">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="modal-panel max-w-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Source notes</p>
                <DialogTitle className="modal-title">{material.title}</DialogTitle>
                <p className="modal-copy">
                  Notes stay private in this browser and connected to this material.
                </p>
              </div>
              {!editing && (
                <button className="primary-button min-h-10 px-4 py-2" onClick={() => startEditing()}>
                  New note
                </button>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-4 text-sm text-rose-700">
                {error}
              </p>
            )}
            {editing ? (
              <div className="mt-5">
                <label className="block text-sm font-medium">
                  {editing.id ? 'Edit note' : 'New note'}
                  <textarea
                    className={field}
                    rows={6}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    autoFocus
                  />
                </label>
                <div className="mt-4 flex justify-end gap-2">
                  <button className="action" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                  <button
                    className="primary-button min-h-10 px-4 py-2"
                    disabled={saving}
                    onClick={() => void save()}
                  >
                    {saving ? 'Saving…' : 'Save note'}
                  </button>
                </div>
              </div>
            ) : notes.length ? (
              <div className="mt-5 divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
                {notes.map((note) => (
                  <article key={note.id} className="p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-(--ink)">{note.content}</p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-(--muted)">
                      <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                      <span className="flex gap-2">
                        <button className="action" onClick={() => startEditing(note)}>
                          Edit
                        </button>
                        <button className="action-danger" onClick={() => void remove(note)}>
                          Delete
                        </button>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-state">No notes yet. Capture a takeaway or write one while you learn.</p>
            )}
            {!editing && (
              <div className="mt-5 flex justify-end">
                <button className="action" onClick={onClose}>
                  Close
                </button>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
