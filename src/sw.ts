/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;
const sharedUrl = (value: string) => value.match(/https?:\/\/[^\s<>()]+/iu)?.[0] ?? null;
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== 'POST' || requestUrl.pathname !== '/share') return;
  const response = (async () => {
    try {
      const data = await request.formData();
      const submittedUrl = String(data.get('url') || '').trim();
      const shared = sharedUrl(submittedUrl) ?? sharedUrl(String(data.get('text') || '')) ?? submittedUrl;
      const parsed = new URL(shared);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid shared URL');
      const title = String(data.get('title') || '');
      const intakeId = crypto.randomUUID();
      await new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('stop-tumpuk', 2);
        open.onupgradeneeded = () => {
          const database = open.result;
          const materials = database.objectStoreNames.contains('materials')
            ? open.transaction!.objectStore('materials')
            : database.createObjectStore('materials', { keyPath: 'id' });
          if (!materials.indexNames.contains('normalizedUrl'))
            materials.createIndex('normalizedUrl', 'normalizedUrl');
          if (!materials.indexNames.contains('status')) materials.createIndex('status', 'status');
          if (!materials.indexNames.contains('updatedAt')) materials.createIndex('updatedAt', 'updatedAt');
          if (!database.objectStoreNames.contains('settings'))
            database.createObjectStore('settings', { keyPath: 'id' });
          const events = database.objectStoreNames.contains('events')
            ? open.transaction!.objectStore('events')
            : database.createObjectStore('events', { keyPath: 'id' });
          if (!events.indexNames.contains('materialId')) events.createIndex('materialId', 'materialId');
          if (!events.indexNames.contains('type')) events.createIndex('type', 'type');
          if (!events.indexNames.contains('at')) events.createIndex('at', 'at');
          const intake = database.objectStoreNames.contains('captureIntake')
            ? open.transaction!.objectStore('captureIntake')
            : database.createObjectStore('captureIntake', { keyPath: 'id' });
          if (!intake.indexNames.contains('receivedAt')) intake.createIndex('receivedAt', 'receivedAt');
        };
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const database = open.result;
          const transaction = database.transaction('captureIntake', 'readwrite');
          transaction
            .objectStore('captureIntake')
            .put({ id: intakeId, url: shared, title: title || null, receivedAt: new Date().toISOString() });
          transaction.oncomplete = () => {
            database.close();
            resolve();
          };
          transaction.onerror = () => {
            database.close();
            reject(transaction.error);
          };
        };
      });
      const destination = new URL('/', self.location.origin);
      destination.searchParams.set('capture', intakeId);
      return Response.redirect(destination.toString(), 303);
    } catch {
      const destination = new URL('/', self.location.origin);
      destination.searchParams.set('shareError', 'We could not find a valid HTTP(S) link in that share.');
      return Response.redirect(destination.toString(), 303);
    }
  })();
  event.respondWith(response);
  event.waitUntil(response.then(() => undefined));
});
