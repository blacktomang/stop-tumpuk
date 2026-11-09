import { classifyUrl, inferredTitle, normalizeUrl } from '../domain';
import { enrichMetadata } from '../providers/metadata-provider';
import {
  addMaterial,
  findMaterialByNormalizedUrl,
  getMaterial,
  updateMaterial,
} from '../repositories/material-repository';
import type { Material } from '../types';

export type CaptureResult =
  | { kind: 'saved'; material: Material }
  | {
      kind: 'duplicate';
      existing: Material;
      retry: () => Promise<CaptureResult>;
    };

function newMaterial(rawUrl: string): Material {
  const { url, type, source } = classifyUrl(rawUrl);
  const timestamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    originalUrl: url.toString(),
    normalizedUrl: normalizeUrl(url),
    domain: url.hostname.replace(/^www\./, ''),
    title: inferredTitle(url),
    thumbnailUrl: null,
    type,
    status: 'inbox',
    priority: 2,
    contentSeconds: null,
    durationSource: source,
    completeness: 'unknown',
    wordCount: null,
    playbackSpeed: 1,
    effortMultiplier: 1.5,
    manualEffortSeconds: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

async function enrichSavedMaterial(material: Material): Promise<void> {
  try {
    const patch = await enrichMetadata(material);
    const current = await getMaterial(material.id);
    if (!current || current.originalUrl !== material.originalUrl) return;
    const untouchedTitle = current.title === inferredTitle(new URL(material.originalUrl));
    const safePatch = untouchedTitle ? patch : { thumbnailUrl: patch.thumbnailUrl, type: patch.type };
    if (Object.values(safePatch).some((value) => value !== undefined)) {
      await updateMaterial(material.id, {
        ...safePatch,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch {
    // Metadata is optional. Capture remains successful when a provider is unavailable.
  }
}

export async function captureUrl(rawUrl: string, allowDuplicate = false): Promise<CaptureResult> {
  const material = newMaterial(rawUrl.trim());
  const existing = await findMaterialByNormalizedUrl(material.normalizedUrl);
  if (existing && !allowDuplicate) {
    return {
      kind: 'duplicate',
      existing,
      retry: () => captureUrl(rawUrl, true),
    };
  }
  await addMaterial(material);
  void enrichSavedMaterial(material);
  return { kind: 'saved', material };
}
