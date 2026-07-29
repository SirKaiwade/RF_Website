import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  ChevronDown,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Pencil,
  Plus,
  Sheet,
  Trash2,
  Users,
  List,
} from 'lucide-react';
import type { Publication } from '../types';
import {
  formatAuthors,
  getPublication,
  PUBLICATION_TYPE_DEFINITIONS,
  PUBLICATION_TYPES,
  publicationsStore,
} from '../data/publications';
import PublicationsSheetEditor from './PublicationsSheetEditor';
import PublicationEditor from './PublicationEditor';
import SpreadsheetImport from './SpreadsheetImport';
import { useLocalDataInfo } from '../lib/localDataSync';
import { classNames, formatDate } from '../lib/format';
import type { ShellContext } from './AppShell';
import { EmptyState, FilterChip, MetaSummary, PageHeader, SearchField, SegmentedControl } from './ui';
import { makeRecordId } from '../lib/recordId';

const TYPE_CHIP_COLORS = ['chip-blue', 'chip-green', 'chip-amber', 'chip-teal', 'chip-red'];

function typeChipClass(type: string | null): string {
  if (!type) return 'chip-gray';
  const i = PUBLICATION_TYPES.indexOf(type as (typeof PUBLICATION_TYPES)[number]);
  return i === -1 ? 'chip-gray' : TYPE_CHIP_COLORS[i % TYPE_CHIP_COLORS.length];
}

type ViewMode = 'list' | 'sheet';

export default function PublicationsPage() {
  const ctx = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const publications = publicationsStore.use();
  const dataInfo = useLocalDataInfo();

  const [view, setView] = useState<ViewMode>('list');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [wpFilter, setWpFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Publication | null>(null);

  useEffect(() => {
    const open = searchParams.get('open');
    if (open) {
      setSelectedId(open);
      setView('list');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of PUBLICATION_TYPES) counts.set(t, 0);
    for (const p of publications) {
      if (p.type && counts.has(p.type)) {
        counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
      }
    }
    return counts;
  }, [publications]);

  const workPackages = useMemo(() => {
    const set = new Set<string>();
    publications.forEach((p) => p.workPackage && set.add(p.workPackage));
    return [...set].sort();
  }, [publications]);

  const stats = useMemo(() => {
    const peerReviewed = publications.filter((p) => p.type === 'Journal article').length;
    const withLink = publications.filter((p) => p.link).length;
    return { total: publications.length, peerReviewed, withLink };
  }, [publications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications
      .filter((p) => {
        if (!p.title.trim() && view === 'list') return false;
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (wpFilter !== 'all' && p.workPackage !== wpFilter) return false;
        if (!q) return true;
        return [p.title, p.firstAuthor, p.otherAuthors, p.outlet, p.workPackage, p.purpose]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      })
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title));
  }, [publications, query, typeFilter, wpFilter, view]);

  const selected = selectedId ? getPublication(selectedId) ?? null : null;

  function askNexusAbout(p: Publication) {
    ctx.sendMessage(`What do we know about the publication "${p.title}"?`);
    navigate('/');
  }

  function openAdd() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(p: Publication) {
    setEditing(p);
    setEditorOpen(true);
  }

  function savePublication(record: Publication) {
    const id = record.id || makeRecordId('pub', record.title.toLowerCase());
    const next = { ...record, id };
    if (editing) publicationsStore.update(next);
    else publicationsStore.add(next);
    setSelectedId(id);
  }

  function deletePublication(p: Publication) {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    publicationsStore.remove(p.id);
    setSelectedId(null);
  }

  return (
    <section
      className={classNames(
        'flex-1 min-w-0 flex flex-col bg-surface relative',
        ctx.openDocId ? 'border-r border-rule' : ''
      )}
    >
      <PageHeader
        icon={BookOpen}
        title="Publications"
        subtitle={`${publications.filter((p) => p.title.trim()).length} outputs${dataInfo.label ? ` · ${dataInfo.label}` : ''}`}
        search={
          view === 'list' ? (
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search publications…"
              className="hidden sm:block"
            />
          ) : undefined
        }
        actions={
          <>
            <SegmentedControl
              ariaLabel="View mode"
              value={view}
              onChange={setView}
              options={[
                { value: 'list', label: 'List', icon: List },
                { value: 'sheet', label: 'Sheet', icon: Sheet },
              ]}
            />
            {view === 'list' && (
              <button type="button" onClick={openAdd} className="btn btn-secondary btn-sm">
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
            <SpreadsheetImport kind="publications" />
          </>
        }
      />

      <div className="toolbar">
        <FilterChip
          active={typeFilter === 'all'}
          count={publications.filter((p) => p.title.trim()).length}
          onClick={() => setTypeFilter('all')}
        >
          All
        </FilterChip>
        {PUBLICATION_TYPES.map((type) => (
          <FilterChip
            key={type}
            active={typeFilter === type}
            count={typeCounts.get(type) ?? 0}
            onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
          >
            {type}
          </FilterChip>
        ))}

        <select
          value={wpFilter}
          onChange={(e) => setWpFilter(e.target.value)}
          className="select w-auto max-w-[240px] py-1.5 text-[12px] ml-auto"
          aria-label="Filter by work package"
        >
          <option value="all">All work packages</option>
          {workPackages.map((wp) => (
            <option key={wp} value={wp}>
              {wp}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-5 lg:py-6 space-y-4">
          {view === 'list' && (
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search publications…"
              className="sm:hidden max-w-none"
            />
          )}

          <MetaSummary
            items={[
              { label: 'outputs', value: stats.total },
              { label: 'journal articles', value: stats.peerReviewed },
              { label: 'with link / DOI', value: stats.withLink },
            ]}
          />

          <PublicationTypeKey />

          {view === 'sheet' ? (
            <PublicationsSheetEditor rows={publications} />
          ) : publications.filter((p) => p.title.trim()).length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No publications yet"
              description="Browse in list view, or switch to Sheet to paste your mastersheet from Excel. You can also add one at a time."
              action={
                <div className="flex flex-wrap gap-2 justify-center">
                  <button type="button" onClick={() => setView('sheet')} className="btn btn-primary btn-sm">
                    <Sheet className="w-3.5 h-3.5" />
                    Open sheet editor
                  </button>
                  <button type="button" onClick={openAdd} className="btn btn-secondary btn-sm">
                    <Plus className="w-3.5 h-3.5" />
                    Add a publication
                  </button>
                </div>
              }
            />
          ) : filtered.length === 0 ? (
            <div className="text-center text-[13px] text-gray-500 py-16 border border-dashed border-rule rounded-sm">
              {query.trim()
                ? `No publications match "${query}" with these filters.`
                : 'No publications match these filters.'}
            </div>
          ) : (
            <ul className="border border-rule rounded-sm divide-y divide-rule bg-surface">
              {filtered.map((p) => (
                <PublicationRow
                  key={p.id}
                  publication={p}
                  chipClass={typeChipClass(p.type)}
                  active={selectedId === p.id}
                  onOpen={() => setSelectedId(p.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {view === 'list' && selected && (
        <PublicationDetail
          publication={selected}
          chipClass={typeChipClass(selected.type)}
          onClose={() => setSelectedId(null)}
          onAskNexus={() => askNexusAbout(selected)}
          onEdit={() => openEdit(selected)}
          onDelete={() => deletePublication(selected)}
        />
      )}

      {editorOpen && (
        <PublicationEditor
          initial={editing ?? undefined}
          onClose={() => setEditorOpen(false)}
          onSave={savePublication}
        />
      )}
    </section>
  );
}

function PublicationTypeKey() {
  return (
    <details className="publication-type-key group border border-rule rounded-sm bg-surface">
      <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none select-none hover:bg-gray-50">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-ink tracking-wide uppercase">
            Publication type key
          </div>
          <div className="text-[12px] text-gray-500 mt-0.5">
            Filters above use these categories
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180"
          strokeWidth={1.75}
        />
      </summary>
      <div className="border-t border-rule px-4 py-3">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {PUBLICATION_TYPES.map((type) => {
            const definition = PUBLICATION_TYPE_DEFINITIONS[type];
            return (
              <div key={type} className="min-w-0">
                <dt className="text-[12px] font-semibold text-ink">{type}</dt>
                {definition ? (
                  <dd className="text-[12px] text-gray-500 mt-0.5 leading-snug">{definition}</dd>
                ) : null}
              </div>
            );
          })}
        </dl>
      </div>
    </details>
  );
}

function PublicationRow({
  publication: p,
  chipClass,
  active,
  onOpen,
}: {
  publication: Publication;
  chipClass: string;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={classNames(
          'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors',
          active ? 'bg-un-blue-bg/60' : ''
        )}
      >
        <div className="w-8 h-8 rounded-sm bg-un-blue-bg text-un-blue flex items-center justify-center shrink-0 mt-0.5">
          <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-ink leading-snug line-clamp-2">
            {p.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
            {formatAuthors(p) && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <Users className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                <span className="truncate max-w-[320px]">{formatAuthors(p)}</span>
              </span>
            )}
            {p.outlet && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <Building2 className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                <span className="truncate max-w-[240px]">{p.outlet}</span>
              </span>
            )}
            {p.date && <span>{formatDate(p.date)}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {p.type && (
            <span className={classNames('chip text-[10px] py-0.5 px-1.5', chipClass)}>
              {p.type}
            </span>
          )}
          {p.link && (
            <span className="inline-flex items-center gap-1 text-[10px] text-un-blue">
              <LinkIcon className="w-3 h-3" strokeWidth={1.75} />
              Link
            </span>
          )}
        </div>
      </button>
    </li>
  );
}

function PublicationDetail({
  publication: p,
  chipClass,
  onClose,
  onAskNexus,
  onEdit,
  onDelete,
}: {
  publication: Publication;
  chipClass: string;
  onClose: () => void;
  onAskNexus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const definition =
    p.type && p.type in PUBLICATION_TYPE_DEFINITIONS
      ? PUBLICATION_TYPE_DEFINITIONS[p.type as keyof typeof PUBLICATION_TYPE_DEFINITIONS]
      : undefined;

  return (
    <>
      <button
        type="button"
        aria-label="Close publication details"
        className="fixed inset-0 z-40 bg-ink/20 md:bg-transparent"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-rule shadow-panel flex flex-col fade-in">
        <div className="px-5 py-4 border-b border-rule flex items-start gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            {p.type && (
              <span className={classNames('chip text-[10px] mb-2', chipClass)}>{p.type}</span>
            )}
            <h2 className="text-[16px] font-semibold text-ink leading-snug">{p.title}</h2>
            {definition && (
              <p className="mt-2 text-[12px] text-gray-500 leading-snug">{definition}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-[13px]">
          {formatAuthors(p) && (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Authors</div>
              <div>{formatAuthors(p)}</div>
            </div>
          )}
          {p.outlet && (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Outlet</div>
              <div>{p.outlet}</div>
            </div>
          )}
          {p.date && (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Date</div>
              <div>{formatDate(p.date)}</div>
            </div>
          )}
          {p.purpose && (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Purpose</div>
              <div className="leading-relaxed">{p.purpose}</div>
            </div>
          )}
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-un-blue hover:underline"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Open link / DOI
            </a>
          )}
        </div>
        <div className="px-5 py-3 border-t border-rule flex flex-wrap gap-2 shrink-0">
          <button type="button" onClick={onAskNexus} className="btn btn-primary btn-sm">
            <MessageSquare className="w-3.5 h-3.5" />
            Ask Nexus
          </button>
          <button type="button" onClick={onEdit} className="btn btn-secondary btn-sm">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button type="button" onClick={onDelete} className="btn btn-ghost btn-sm text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </aside>
    </>
  );
}
