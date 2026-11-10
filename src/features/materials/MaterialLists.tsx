import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useState } from 'react';
import { estimateLabel, estimatedSeconds, formatDuration } from '../../domain';
import type { Material, MaterialStatus } from '../../types';

interface MaterialListsProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onNotes: (material: Material) => void;
  onMove: (material: Material, destination: 'inbox' | 'queued' | 'archived') => void;
  onDelete: (material: Material) => void;
}

export function MaterialLists({ materials, onEdit, onNotes, onMove, onDelete }: MaterialListsProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<MaterialStatus | 'all'>('all');
  const visible = materials.filter((material) => {
    const matchesQuery = [material.title, material.domain, material.originalUrl]
      .join(' ')
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase());
    return matchesQuery && (status === 'all' || material.status === status);
  });
  const inbox = visible.filter((material) => material.status === 'inbox');
  const queue = visible.filter(
    (material) => material.status === 'queued' || material.status === 'in-progress',
  );
  const archived = visible.filter((material) => material.status === 'archived');
  const completed = visible.filter((material) => material.status === 'completed');
  return (
    <>
      <section aria-label="Search and filter materials" className="material-filters">
        <label className="sr-only" htmlFor="material-search">
          Search materials
        </label>
        <input
          id="material-search"
          className="material-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, domains, or URLs"
        />
        <label
          className="mt-3 flex items-center gap-3 text-sm font-semibold text-(--ink)"
          htmlFor="status-filter"
        >
          Status
          <select
            id="status-filter"
            className="min-h-10 rounded-lg border border-(--line) bg-white px-3 text-sm font-medium text-(--ink)"
            value={status}
            onChange={(event) => setStatus(event.target.value as MaterialStatus | 'all')}
          >
            <option value="all">All statuses</option>
            <option value="inbox">Inbox</option>
            <option value="queued">Reading plan</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Finished</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </section>
      <section aria-label="Your saved materials" className="workspace-grid">
        <MaterialList
          title="Reading plan"
          materials={queue}
          empty="Add an Inbox item when it is worth making time for."
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
      {completed.length > 0 && <Completed materials={completed} onMove={onMove} onNotes={onNotes} />}
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
  const isInbox = title === 'Inbox';
  const sectionId = isInbox ? 'inbox' : 'queue';
  return (
    <section id={sectionId} className="list-panel scroll-mt-24">
      <div className="list-panel__head">
        <div>
          <h2 className="list-panel__title">{title}</h2>
          <p className="list-panel__copy">
            {isInbox
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
                    {material.domain} · {material.type} · {estimateLabel(material)}
                  </p>
                  <p className="material-effort">
                    Estimated time: <strong>{formatDuration(estimatedSeconds(material))}</strong>
                  </p>
                </div>
              </div>
              <div className="material-actions">
                {isInbox ? (
                  <button
                    className="primary-button min-h-9 px-3 py-1.5 text-xs"
                    onClick={() => onMove(material, 'queued')}
                  >
                    Add to Reading plan
                  </button>
                ) : (
                  <a
                    className="primary-button min-h-9 px-3 py-1.5 text-xs"
                    href={material.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source
                  </a>
                )}
                <AdvancedActions
                  material={material}
                  isInbox={isInbox}
                  onEdit={onEdit}
                  onNotes={onNotes}
                  onMove={onMove}
                  onDelete={onDelete}
                />
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

function AdvancedActions({
  material,
  isInbox,
  onEdit,
  onNotes,
  onMove,
  onDelete,
}: Omit<MaterialListsProps, 'materials'> & { material: Material; isInbox: boolean }) {
  const itemClass =
    'block w-full px-3 py-2.5 text-left text-sm text-(--ink) data-focus:bg-(--surface-soft) data-focus:outline-none';
  return (
    <Menu>
      <MenuButton className="action" aria-label={`Advanced actions for ${material.title}`}>
        Advanced actions
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        className="z-30 mt-2 w-52 origin-top-right rounded-xl border border-(--line) bg-(--surface) p-1 shadow-lg outline-none"
      >
        <MenuItem>
          {({ close }) => (
            <button className={itemClass} onClick={() => (close(), onEdit(material))}>
              Edit material
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ close }) => (
            <button className={itemClass} onClick={() => (close(), onNotes(material))}>
              Notes
            </button>
          )}
        </MenuItem>
        {!isInbox && (
          <MenuItem>
            {({ close }) => (
              <button className={itemClass} onClick={() => (close(), onMove(material, 'inbox'))}>
                Return to Inbox
              </button>
            )}
          </MenuItem>
        )}
        <MenuItem>
          {({ close }) => (
            <button className={itemClass} onClick={() => (close(), onMove(material, 'archived'))}>
              Archive
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ close }) => (
            <button
              className={`${itemClass} text-rose-700 data-focus:bg-rose-50`}
              onClick={() => (close(), onDelete(material))}
            >
              Delete
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

function Completed({
  materials,
  onMove,
  onNotes,
}: Pick<MaterialListsProps, 'onMove' | 'onNotes'> & { materials: Material[] }) {
  return (
    <section className="archive-panel">
      <div className="mb-4">
        <h2 className="list-panel__title">Finished</h2>
        <p className="list-panel__copy">
          Deliberately finished materials. Reopen one if you want to return to it.
        </p>
      </div>
      <div>
        {materials.map((material) => (
          <div key={material.id} className="archive-row">
            <span className="truncate text-sm font-medium text-(--ink)">{material.title}</span>
            <span className="flex shrink-0 gap-2">
              <button className="action" onClick={() => onNotes(material)}>
                Notes
              </button>
              <button className="action" onClick={() => onMove(material, 'queued')}>
                Reopen
              </button>
            </span>
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
