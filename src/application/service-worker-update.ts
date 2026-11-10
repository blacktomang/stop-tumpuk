export interface WaitingServiceWorker {
  postMessage(message: { type: 'SKIP_WAITING' }): void;
  state?: string;
  addEventListener?(type: 'statechange', listener: () => void): void;
}

export interface ServiceWorkerRegistrationLike {
  waiting: WaitingServiceWorker | null;
  installing: WaitingServiceWorker | null;
  addEventListener(type: 'updatefound', listener: () => void): void;
  removeEventListener(type: 'updatefound', listener: () => void): void;
}

export interface ServiceWorkerContainerLike {
  controller: unknown;
  register(scriptURL: string, options: { scope: string }): Promise<ServiceWorkerRegistrationLike>;
  addEventListener(type: 'controllerchange', listener: () => void, options?: { once?: boolean }): void;
}

/** Watches for a waiting worker without activating it until the user chooses to reload. */
export function watchForServiceWorkerUpdate(
  container: ServiceWorkerContainerLike,
  onWaiting: (worker: WaitingServiceWorker) => void,
): () => void {
  let registration: ServiceWorkerRegistrationLike | undefined;
  let mounted = true;
  const offerUpdate = () => {
    if (mounted && registration?.waiting && container.controller) onWaiting(registration.waiting);
  };
  const watchInstallingWorker = () => {
    const installing = registration?.installing;
    installing?.addEventListener?.('statechange', () => {
      if (installing.state === 'installed') offerUpdate();
    });
  };
  void container
    .register('/sw.js', { scope: '/' })
    .then((nextRegistration) => {
      registration = nextRegistration;
      offerUpdate();
      registration.addEventListener('updatefound', watchInstallingWorker);
    })
    .catch(() => {
      // The normal browser workflow remains usable if PWA registration is unavailable.
    });
  return () => {
    mounted = false;
    registration?.removeEventListener('updatefound', watchInstallingWorker);
  };
}

/** Activates a waiting worker only after the user has accepted the reload. */
export function activateWaitingServiceWorker(
  container: ServiceWorkerContainerLike,
  worker: WaitingServiceWorker,
  reload: () => void,
) {
  container.addEventListener('controllerchange', reload, { once: true });
  worker.postMessage({ type: 'SKIP_WAITING' });
}
