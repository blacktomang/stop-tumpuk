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

export async function addMaterial(material: Material): Promise<void> {
  await db.transaction('rw', db.materials, db.events, async () => {
    await db.materials.add(material);
    await db.events.add({
      id: crypto.randomUUID(),
      materialId: material.id,
      type: 'captured',
      at: material.createdAt,
    });
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
    await db.materials.update(material.id, { status, updatedAt: at });
    if (status === 'queued' || status === 'archived') {
      await db.events.add({
        id: crypto.randomUUID(),
        materialId: material.id,
        type: status,
        at,
      });
    }
  });
}

export async function deleteMaterial(material: Material): Promise<void> {
  await db.transaction('rw', db.materials, db.events, async () => {
    await db.materials.delete(material.id);
    await db.events.where('materialId').equals(material.id).delete();
  });
}
