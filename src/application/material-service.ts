import { classifyUrl, inferredTitle, normalizeUrl } from '../domain';
import {
  changeMaterialStatus,
  deleteMaterial,
  updateMaterialDraft,
} from '../repositories/material-repository';
import type { Material, MaterialDraft, MaterialStatus } from '../types';

export async function saveMaterialDraft(
  material: Material,
  draft: MaterialDraft,
  rawUrl: string,
): Promise<void> {
  const { url } = classifyUrl(rawUrl.trim());
  await updateMaterialDraft(
    material,
    {
      originalUrl: url.toString(),
      normalizedUrl: normalizeUrl(url),
      domain: url.hostname.replace(/^www\./, ''),
    },
    { ...draft, title: draft.title.trim() || inferredTitle(url) },
  );
}

export { changeMaterialStatus, deleteMaterial };
export type { MaterialStatus };
