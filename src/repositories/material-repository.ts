import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Material, MaterialDraft, MaterialStatus } from '../types';

export function useMaterials(): Material[] {
  return useLiveQuery(() => db.materials.orderBy('updatedAt').reverse().toArray(), [], []) ?? [];
}

export async function findMaterialByNormalizedUrl(normalizedUrl: string): Promise<Material | undefined> {
  return db.materials.where('normalizedUrl').equals(normalizedUrl).first();
}

export async function getMaterial(id: string): Promise<Material | undefined> {
  return db.materials.get(id);
}

/**
 * Saves a capture and its initial lifecycle history as one durable operation.
 * A direct Reading-plan capture is both captured and committed; an Inbox
 * capture records only the capture.
 */
export async function addCapturedMaterial(material: Material, intakeId?: string): Promise<void> {
  await db.transaction('rw', db.materials, db.events, db.captureIntake, async () => {
    if (intakeId && !(await db.captureIntake.get(intakeId))) {
      throw new Error('This shared link is no longer available. Please paste it again.');
    }
    await db.materials.add(material);
    await db.events.add({
      id: crypto.randomUUID(),
      materialId: material.id,
      type: 'captured',
      at: material.createdAt,
    });
    if (material.status === 'queued') {
      await db.events.add({
        id: crypto.randomUUID(),
        materialId: material.id,
        type: 'queued',
        at: material.createdAt,
      });
    }
    if (intakeId) await db.captureIntake.delete(intakeId);
  });
}

export async function updateMaterial(id: string, patch: Partial<Material>): Promise<void> {
  await db.materials.update(id, patch);
}

export async function updateMaterialDraft(
  material: Material,
  source: Pick<Material, 'originalUrl' | 'normalizedUrl' | 'domain'>,
  draft: MaterialDraft,
): Promise<void> {
  await db.materials.update(material.id, {
    ...draft,
    ...source,
    updatedAt: new Date().toISOString(),
  });
}

export async function changeMaterialStatus(material: Material, status: MaterialStatus): Promise<void> {
  const at = new Date().toISOString();
  await db.transaction('rw', db.materials, db.events, async () => {
    const current = await db.materials.get(material.id);
    if (!current) throw new Error('This material no longer exists.');
    if (current.status === status) return;
    await db.materials.update(current.id, { status, updatedAt: at });
    const eventType =
      status === 'completed'
        ? 'completed'
        : status === 'in-progress'
          ? 'in-progress'
          : current.status === 'completed' && (status === 'queued' || status === 'inbox')
            ? 'reopened'
            : status === 'queued' || status === 'archived'
              ? status
              : null;
    if (eventType) {
      await db.events.add({
        id: crypto.randomUUID(),
        materialId: material.id,
        type: eventType,
        at,
      });
    }
  });
}

export async function deleteMaterial(material: Material): Promise<void> {
  await db.transaction('rw', db.materials, db.events, db.notes, db.sessions, async () => {
    await db.materials.delete(material.id);
    await db.events.where('materialId').equals(material.id).delete();
    await db.notes.where('materialId').equals(material.id).delete();
    await db.sessions.where('materialId').equals(material.id).delete();
  });
}
