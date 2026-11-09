import { useEffect, useState } from 'react';
import { nextAvailabilityReminder, shouldPromptForAvailability } from './application/availability-reminder';
import { changeMaterialStatus, deleteMaterial } from './application/material-service';
import { consumeShareIntake } from './application/share-intake-service';
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
import type { Material } from './types';

export default function App() {
  const materials = useMaterials();
  const settings = useSettings();
  const [editing, setEditing] = useState<Material | null>(null);
  const [notesFor, setNotesFor] = useState<Material | null>(null);
  const [dataDialog, setDataDialog] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [intakeUrl, setIntakeUrl] = useState<string | null>(null);
  const [operationError, setOperationError] = useState('');
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
    void consumeShareIntake(intakeId).then((url) => {
      setIntakeUrl(url);
      history.replaceState({}, '', location.pathname);
    });
  }, []);

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
          <nav aria-label="stop-tumpuk navigation" className="app-nav">
            <a className="nav-link" href="#queue">
              Queue
            </a>
            <a className="nav-link" href="#inbox">
              Inbox
            </a>
            <button className="nav-link nav-link--action" onClick={() => setOnboarding(true)}>
              Set time
            </button>
            <button className="nav-link" onClick={() => setDataDialog(true)}>
              Data
            </button>
          </nav>
        </div>
      </header>
      <div className="app-content">
        {operationError && (
          <p role="alert" className="status-error">
            {operationError}
          </p>
        )}
        <CaptureForm intakeUrl={intakeUrl} />
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
      <EditMaterialDialog
        material={editing}
        readingWpm={settings.readingWpm}
        onClose={() => setEditing(null)}
      />
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
