import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { nextAvailabilityReminder, shouldPromptForAvailability } from './application/availability-reminder';
import { changeMaterialStatus, deleteMaterial } from './application/material-service';
import { loadShareIntake } from './application/share-intake-service';
import {
  activateWaitingServiceWorker,
  watchForServiceWorkerUpdate,
} from './application/service-worker-update';
import { saveSettings } from './application/settings-service';
import { CaptureForm } from './features/capture/CaptureForm';
import { CommitmentDashboard } from './features/dashboard/CommitmentDashboard';
import { EditMaterialDialog } from './features/materials/EditMaterialDialog';
import { MaterialLists } from './features/materials/MaterialLists';
import { LearningWorkspace } from './features/learning/LearningWorkspace';
import { DataDialog } from './features/data/DataDialog';
import { NotesDialog } from './features/notes/NotesDialog';
import { AvailabilityDialog } from './features/settings/AvailabilityDialog';
import { useMaterials } from './repositories/material-repository';
import { useSettings } from './repositories/settings-repository';
import type { CaptureIntake, Material } from './types';

export default function App() {
  const materials = useMaterials();
  const settings = useSettings();
  const [editing, setEditing] = useState<Material | null>(null);
  const [notesFor, setNotesFor] = useState<Material | null>(null);
  const [dataDialog, setDataDialog] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [intake, setIntake] = useState<CaptureIntake | null>(null);
  const [operationError, setOperationError] = useState('');
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const shouldPromptAvailability = shouldPromptForAvailability(settings);

  useEffect(() => {
    setOnboarding(shouldPromptAvailability);
  }, [shouldPromptAvailability]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shareError = params.get('shareError');
    if (shareError) {
      setOperationError(shareError);
      history.replaceState({}, '', location.pathname);
      return;
    }
    const intakeId = params.get('capture');
    if (!intakeId) return;
    void loadShareIntake(intakeId).then((nextIntake) => {
      if (nextIntake) {
        setIntake(nextIntake);
      } else {
        setOperationError('That shared link is no longer available. Please paste it instead.');
        history.replaceState({}, '', location.pathname);
      }
    });
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    return watchForServiceWorkerUpdate(navigator.serviceWorker, (worker) =>
      setWaitingWorker(worker as ServiceWorker),
    );
  }, []);

  function applyUpdate() {
    if (!waitingWorker) return;
    activateWaitingServiceWorker(navigator.serviceWorker, waitingWorker, () => location.reload());
  }

  function clearSavedIntake() {
    setIntake(null);
    const current = new URL(location.href);
    current.searchParams.delete('capture');
    history.replaceState({}, '', current.pathname + current.search + current.hash);
  }

  async function moveMaterial(material: Material, status: 'inbox' | 'queued' | 'archived') {
    try {
      setOperationError('');
      await changeMaterialStatus(material, status);
    } catch {
      setOperationError('That change was not saved. Please try again.');
    }
  }

  async function removeMaterial(material: Material) {
    if (!confirm(`Delete “${material.title}”?`)) return;
    try {
      setOperationError('');
      await deleteMaterial(material);
    } catch {
      setOperationError('That material was not deleted. Please try again.');
    }
  }

  async function skipAvailability() {
    try {
      await saveSettings({
        ...settings,
        onboardingDismissed: true,
        availabilityReminderAt: nextAvailabilityReminder(),
      });
      setOnboarding(false);
    } catch {
      setOperationError('Your availability preference was not saved. Please try again.');
    }
  }

  async function saveAvailability(next: typeof settings) {
    try {
      await saveSettings({ ...next, onboardingDismissed: true, availabilityReminderAt: null });
      setOnboarding(false);
    } catch {
      setOperationError('Your availability preference was not saved. Please try again.');
    }
  }

  function openFromMobileMenu(action: () => void, closeMenu?: () => void) {
    if (!closeMenu) {
      action();
      return;
    }
    closeMenu();
    window.setTimeout(action, 0);
  }

  function navigationItems(closeMenu?: () => void) {
    return (
      <>
        <a className="nav-link" href="#reading-plan" onClick={() => closeMenu?.()}>
          Reading plan
        </a>
        <a className="nav-link" href="#inbox" onClick={() => closeMenu?.()}>
          Inbox
        </a>
        <button
          className="nav-link nav-link--action"
          onClick={() => openFromMobileMenu(() => setOnboarding(true), closeMenu)}
        >
          Set time
        </button>
        <button className="nav-link" onClick={() => openFromMobileMenu(() => setDataDialog(true), closeMenu)}>
          Data
        </button>
      </>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <span aria-hidden="true" className="brand-mark">
              <span />
              <span />
              <span />
              <span />
            </span>
            <div>
              <h1 className="brand__name">stop-tumpuk</h1>
              <p className="brand__line">Make space for what you want to learn.</p>
            </div>
          </div>
          <nav aria-label="stop-tumpuk navigation" className="app-nav hidden md:flex">
            {navigationItems()}
          </nav>
          <Popover className="relative shrink-0 md:hidden">
            {({ open, close }) => (
              <>
                <PopoverButton
                  aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                  className="nav-link flex size-11 items-center justify-center p-2"
                >
                  {open ? (
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  ) : (
                    <Bars3Icon aria-hidden="true" className="size-6" />
                  )}
                </PopoverButton>
                <PopoverPanel className="absolute right-0 top-full mt-3 w-52 rounded-xl border border-(--line) bg-(--surface) p-2 shadow-lg">
                  <nav
                    aria-label="stop-tumpuk navigation"
                    className="flex flex-col gap-1 text-sm font-medium [&>.nav-link]:min-h-11 [&>.nav-link]:text-left"
                  >
                    {navigationItems(close)}
                  </nav>
                </PopoverPanel>
              </>
            )}
          </Popover>
        </div>
      </header>
      {waitingWorker && (
        <aside className="update-notice" aria-label="Update available" role="status">
          <p>A newer version is ready. Reload when you are ready to apply it.</p>
          <div className="flex shrink-0 gap-2">
            <button className="action" onClick={() => setWaitingWorker(null)}>
              Later
            </button>
            <button className="primary-action" onClick={applyUpdate}>
              Reload now
            </button>
          </div>
        </aside>
      )}
      <div className="app-content">
        {operationError && (
          <p role="alert" className="status-error">
            {operationError}
          </p>
        )}
        <CaptureForm intake={intake} onIntakeSaved={clearSavedIntake} />
        <CommitmentDashboard
          materials={materials}
          weekdayMinutes={settings.weekdayMinutes}
          weekendMinutes={settings.weekendMinutes}
          onAvailability={() => setOnboarding(true)}
        />
        <LearningWorkspace
          materials={materials}
          onInProgress={(material) =>
            material.status === 'in-progress'
              ? Promise.resolve()
              : changeMaterialStatus(material, 'in-progress')
          }
          onComplete={(material) => changeMaterialStatus(material, 'completed')}
          onNotes={setNotesFor}
        />
        <MaterialLists
          materials={materials}
          onEdit={setEditing}
          onNotes={setNotesFor}
          onMove={(material, status) => void moveMaterial(material, status)}
          onDelete={(material) => void removeMaterial(material)}
        />
      </div>
      <EditMaterialDialog material={editing} onClose={() => setEditing(null)} />
      <NotesDialog material={notesFor} onClose={() => setNotesFor(null)} />
      <DataDialog open={dataDialog} onClose={() => setDataDialog(false)} />
      <AvailabilityDialog
        open={onboarding}
        settings={settings}
        onClose={() => void skipAvailability()}
        onSave={saveAvailability}
      />
    </main>
  );
}
