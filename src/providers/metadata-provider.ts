import type { Material } from '../types';

export type MetadataPatch = Pick<Material, 'title' | 'thumbnailUrl' | 'type'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Best-effort provider adapter; provider failures never invalidate a saved material. */
export async function enrichMetadata(material: Material): Promise<Partial<MetadataPatch>> {
  const host = new URL(material.originalUrl).hostname.toLowerCase();
  if (!host.includes('youtube.com') && !host.includes('youtu.be')) return {};
  const endpoint = new URL('https://www.youtube.com/oembed');
  endpoint.searchParams.set('url', material.originalUrl);
  endpoint.searchParams.set('format', 'json');
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) return {};
  const body: unknown = await response.json();
  if (!isRecord(body) || typeof body.title !== 'string' || !body.title.trim()) return {};
  const thumbnailUrl =
    typeof body.thumbnail_url === 'string' && body.thumbnail_url.startsWith('https://')
      ? body.thumbnail_url
      : null;
  return { title: body.title.trim(), thumbnailUrl, type: 'video' };
}
