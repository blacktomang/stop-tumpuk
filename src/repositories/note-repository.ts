import { db } from '../db';
import type { Note } from '../types';

export async function createTakeaway(materialId: string, content: string): Promise<Note> {
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    materialId,
    content: content.trim(),
    createdAt: now,
    updatedAt: now,
  };
  await db.notes.add(note);
  return note;
}
