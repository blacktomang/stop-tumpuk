import { effortSeconds, formatDuration } from '../../domain';
import type { Material } from '../../types';

interface MaterialListsProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onNotes: (material: Material) => void;
  onMove: (material: Material, destination: 'inbox' | 'queued' | 'archived') => void;
  onDelete: (material: Material) => void;
}

export function MaterialLists({ materials, onEdit, onNotes, onMove, onDelete }: MaterialListsProps) {
  const inbox = materials.filter((material) => material.status === 'inbox');
  const queue = materials.filter(
    (material) => material.status === 'queued' || material.status === 'in-progress',
  );
  const archived = materials.filter((material) => material.status === 'archived');
  const completed = materials.filter((material) => material.status === 'completed');
  return (
    <>
      <section aria-label="Your saved materials" className="workspace-grid">
        <MaterialList
          title="Learning queue"
          materials={queue}
          empty="Commit a few Inbox items when they are worth your time."
          onEdit={onEdit}
          onNotes={onNotes}
          onMove={onMove}
          onDelete={onDelete}
        />
        <MaterialList
          title="Inbox"
          materials={inbox}
          empty="Your saved links will appear here."
          onEdit={onEdit}
          onNotes={onNotes}
          onMove={onMove}
          onDelete={onDelete}
        />
      </section>
      {archived.length > 0 && <Archived materials={archived} onMove={onMove} onDelete={onDelete} />}
      {completed.length > 0 && <Completed materials={completed} onMove={onMove} />}
    </>
  );
}

function MaterialList({
  title,
  materials,
  empty,
  onEdit,
  onNotes,
  onMove,
  onDelete,
}: Omit<MaterialListsProps, 'materials'> & {
  title: string;
  materials: Material[];
  empty: string;
}) {
  const sectionId = title === 'Inbox' ? 'inbox' : 'queue';
  return (
    <section id={sectionId} className="list-panel scroll-mt-24">
      <div className="list-panel__head">
        <div>
          <h2 className="list-panel__title">{title}</h2>
          <p className="list-panel__copy">
            {title === 'Inbox'
              ? 'Saved links that are not a commitment yet.'
              : 'Items you have chosen to make time for.'}
          </p>
        </div>
        <span className="count-chip">{materials.length}</span>
      </div>
      <div>
        {materials.length ? (
          materials.map((material) => (
            <article key={material.id} className="material-row">
              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <a className="material-title" href={material.originalUrl} target="_blank" rel="noreferrer">
                    {material.title}
                  </a>
                  <p className="material-meta">
                    {material.domain} · {material.type} ·{' '}
                    {material.contentSeconds === null
                      ? 'time unknown'
                      : `${formatDuration(material.contentSeconds)} (${material.durationSource}, ${material.completeness})`}
                  </p>
                  <p className="material-effort">
                    Learning effort: <strong>{formatDuration(effortSeconds(material))}</strong>
                    {material.manualEffortSeconds !== null ? ' (manual)' : ''}
                  </p>
                </div>
                <span className="priority-chip">P{material.priority}</span>
              </div>
              <div className="material-actions">
                <button className="action" onClick={() => onEdit(material)}>
                  Edit estimate
                </button>
                <button className="action" onClick={() => onNotes(material)}>
                  Notes
                </button>
                <button
                  className="action"
                  onClick={() => onMove(material, title === 'Inbox' ? 'queued' : 'inbox')}
                >
                  {title === 'Inbox' ? 'Commit' : 'Return to Inbox'}
                </button>
                <button className="action" onClick={() => onMove(material, 'archived')}>
                  Archive
                </button>
                <button className="action-danger" onClick={() => onDelete(material)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">{empty}</p>
        )}
      </div>
    </section>
  );
}

function Completed({ materials, onMove }: Pick<MaterialListsProps, 'onMove'> & { materials: Material[] }) {
  return (
    <section className="archive-panel">
      <div className="mb-4">
        <h2 className="list-panel__title">Completed</h2>
        <p className="list-panel__copy">
          Deliberately finished materials. Reopen one if you want to return to it.
        </p>
      </div>
      <div>
        {materials.map((material) => (
          <div key={material.id} className="archive-row">
            <span className="truncate text-sm font-medium text-(--ink)">{material.title}</span>
            <button className="action" onClick={() => onMove(material, 'queued')}>
              Reopen
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Archived({
  materials,
  onMove,
  onDelete,
}: Pick<MaterialListsProps, 'onMove' | 'onDelete'> & {
  materials: Material[];
}) {
  return (
    <section className="archive-panel">
      <div className="mb-4">
        <h2 className="list-panel__title">Archived</h2>
        <p className="list-panel__copy">Links you have deliberately taken out of your active list.</p>
      </div>
      <div>
        {materials.map((material) => (
          <div key={material.id} className="archive-row">
            <span className="truncate text-sm font-medium text-(--ink)">{material.title}</span>
            <span className="flex shrink-0 gap-2">
              <button className="action" onClick={() => onMove(material, 'inbox')}>
                Return to Inbox
              </button>
              <button className="action-danger" onClick={() => onDelete(material)}>
                Delete
              </button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
