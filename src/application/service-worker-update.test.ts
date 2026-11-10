import { describe, expect, it, vi } from 'vitest';
import {
  activateWaitingServiceWorker,
  watchForServiceWorkerUpdate,
  type ServiceWorkerContainerLike,
  type ServiceWorkerRegistrationLike,
  type WaitingServiceWorker,
} from './service-worker-update';

function createWorker(): WaitingServiceWorker & { messages: { type: 'SKIP_WAITING' }[] } {
  return {
    messages: [],
    postMessage(message) {
      this.messages.push(message);
    },
  };
}

function createContainer(registration: ServiceWorkerRegistrationLike): ServiceWorkerContainerLike & {
  controllerChange: (() => void) | null;
} {
  return {
    controller: {},
    controllerChange: null,
    register: vi.fn().mockResolvedValue(registration),
    addEventListener(_type, listener) {
      this.controllerChange = listener;
    },
  };
}

describe('service-worker updates', () => {
  it('offers an already waiting worker without activating it', async () => {
    const worker = createWorker();
    const registration: ServiceWorkerRegistrationLike = {
      waiting: worker,
      installing: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const container = createContainer(registration);
    const onWaiting = vi.fn();

    const stop = watchForServiceWorkerUpdate(container, onWaiting);
    await Promise.resolve();

    expect(container.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
    expect(onWaiting).toHaveBeenCalledWith(worker);
    expect(worker.messages).toEqual([]);
    stop();
    expect(registration.removeEventListener).toHaveBeenCalled();
  });

  it('waits for a user action before skipping waiting and reloading on controller change', () => {
    const worker = createWorker();
    const registration: ServiceWorkerRegistrationLike = {
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const container = createContainer(registration);
    const reload = vi.fn();

    activateWaitingServiceWorker(container, worker, reload);

    expect(worker.messages).toEqual([{ type: 'SKIP_WAITING' }]);
    expect(reload).not.toHaveBeenCalled();
    container.controllerChange?.();
    expect(reload).toHaveBeenCalledOnce();
  });
});
