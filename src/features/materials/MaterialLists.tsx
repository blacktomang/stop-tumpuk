import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
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
        <label className="status-filter" htmlFor="material-status-filter">
          <span>Status</span>
          <select
            id="material-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value as MaterialStatus | 'all')}
          >
            <option value="all">All saved materials</option>
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
          empty="Move an Inbox item here when you are ready to make time for it."
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
  title: 'Inbox' | 'Reading plan';
  materials: Material[];
  empty: string;
}) {
  const isInbox = title === 'Inbox';
  return (
    <section id={isInbox ? 'inbox' : 'queue'} className="list-panel scroll-mt-24">
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
              <div className="min-w-0">
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
              <div className="material-actions">
                {isInbox ? (
                  <button className="primary-action" onClick={() => onMove(material, 'queued')}>
                    Add to Reading plan
                  </button>
                ) : (
                  <a className="primary-action" href={material.originalUrl} target="_blank" rel="noreferrer">
                    Open source
                  </a>
                )}
                <MaterialActions
                  material={material}
                  onEdit={onEdit}
                  onNotes={onNotes}
                  onMove={onMove}
                  onDelete={onDelete}
                  includeReturn={!isInbox}
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

function MaterialActions({
  material,
  onEdit,
  onNotes,
  onMove,
  onDelete,
  includeReturn,
}: Omit<MaterialListsProps, 'materials'> & { material: Material; includeReturn: boolean }) {
  return (
    <Menu as="div" className="relative">
      <MenuButton className="action-icon" aria-label={`Advanced actions for ${material.title}`}>
        <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
      </MenuButton>
      <MenuItems anchor="bottom end" className="action-menu">
        <MenuItem>
          <button className="action-menu__item" onClick={() => onEdit(material)}>
            Edit estimated time
          </button>
        </MenuItem>
        <MenuItem>
          <button className="action-menu__item" onClick={() => onNotes(material)}>
            Notes
          </button>
        </MenuItem>
        {includeReturn && (
          <MenuItem>
            <button className="action-menu__item" onClick={() => onMove(material, 'inbox')}>
              Return to Inbox
            </button>
          </MenuItem>
        )}
        <MenuItem>
          <button className="action-menu__item" onClick={() => onMove(material, 'archived')}>
            Archive
          </button>
        </MenuItem>
        <MenuItem>
          <button className="action-menu__item action-menu__item--danger" onClick={() => onDelete(material)}>
            Delete
          </button>
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
              <button className="primary-action" onClick={() => onMove(material, 'queued')}>
                Reopen
              </button>
              <Menu as="div" className="relative">
                <MenuButton className="action-icon" aria-label={`Advanced actions for ${material.title}`}>
                  <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
                </MenuButton>
                <MenuItems anchor="bottom end" className="action-menu">
                  <MenuItem>
                    <button className="action-menu__item" onClick={() => onNotes(material)}>
                      Notes
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <a
                      className="action-menu__item"
                      href={material.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu>
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
              <button className="primary-action" onClick={() => onMove(material, 'inbox')}>
                Return to Inbox
              </button>
              <Menu as="div" className="relative">
                <MenuButton className="action-icon" aria-label={`Advanced actions for ${material.title}`}>
                  <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
                </MenuButton>
                <MenuItems anchor="bottom end" className="action-menu">
                  <MenuItem>
                    <button
                      className="action-menu__item action-menu__item--danger"
                      onClick={() => onDelete(material)}
                    >
                      Delete
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
