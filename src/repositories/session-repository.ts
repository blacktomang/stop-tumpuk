import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { LearningSession } from '../types';

function elapsedAt(session: LearningSession, now: Date): number {
  if (session.state !== 'running') return session.elapsedSeconds;
  return (
    session.elapsedSeconds +
    Math.max(0, Math.floor((now.getTime() - Date.parse(session.stateChangedAt)) / 1000))
  );
}

export function useActiveSession(materialId: string): LearningSession | undefined {
  return useLiveQuery(
    () =>
      db.sessions
        .where('materialId')
        .equals(materialId)
        .filter((session) => session.state !== 'ended')
        .first(),
    [materialId],
  );
}

export async function startSession(materialId: string): Promise<LearningSession> {
  const now = new Date().toISOString();
  const session: LearningSession = {
    id: crypto.randomUUID(),
    materialId,
    startedAt: now,
    elapsedSeconds: 0,
    state: 'running',
    stateChangedAt: now,
    endedAt: null,
  };
  await db.sessions.add(session);
  return session;
}

export async function pauseSession(session: LearningSession): Promise<void> {
  const now = new Date();
  await db.sessions.update(session.id, {
    elapsedSeconds: elapsedAt(session, now),
    state: 'paused',
    stateChangedAt: now.toISOString(),
  });
}

export async function resumeSession(session: LearningSession): Promise<void> {
  await db.sessions.update(session.id, { state: 'running', stateChangedAt: new Date().toISOString() });
}

export async function endSession(session: LearningSession): Promise<void> {
  const now = new Date();
  await db.sessions.update(session.id, {
    elapsedSeconds: elapsedAt(session, now),
    state: 'ended',
    stateChangedAt: now.toISOString(),
    endedAt: now.toISOString(),
  });
}
