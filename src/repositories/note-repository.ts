import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Note } from '../types';

function validatedContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Write a note before saving.');
  return trimmed;
}

export function useNotes(materialId: string): Note[] {
  return (
    useLiveQuery(
      () => db.notes.where('materialId').equals(materialId).reverse().sortBy('updatedAt'),
      [materialId],
      [],
    ) ?? []
  );
}

export async function createNote(materialId: string, content: string): Promise<Note> {
  if (!(await db.materials.get(materialId))) throw new Error('This material no longer exists.');
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    materialId,
    content: validatedContent(content),
    createdAt: now,
    updatedAt: now,
  };
  await db.notes.add(note);
  return note;
}

export async function updateNote(note: Note, content: string): Promise<void> {
  await db.notes.update(note.id, { content: validatedContent(content), updatedAt: new Date().toISOString() });
}

export async function deleteNote(note: Note): Promise<void> {
  await db.notes.delete(note.id);
}

export const createTakeaway = createNote;
