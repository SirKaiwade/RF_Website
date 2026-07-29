import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  X,
  ExternalLink,
  Link as LinkIcon,
  MessageSquare,
  Users,
  Layers,
  Target,
  Building2,
  Globe2,
  FileText,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Publication } from '../types';
import {
  formatAuthors,
  getPublication,
  PUBLICATION_TYPE_DEFINITIONS,
  publicationsStore,
} from '../data/publications';
import SpreadsheetImport from './SpreadsheetImport';
import PublicationEditor from './PublicationEditor';
import { useLocalDataInfo } from '../lib/localDataSync';
import { classNames, formatDate } from '../lib/format';
import type { ShellContext } from './AppShell';
import { EmptyState, FilterChip, MetaSummary, PageHeader, SearchField } from './ui';

const TYPE_CHIP_COLORS = ['chip-blue', 'chip-green', 'chip-amber', 'chip-teal', 'chip-red'];

function typeChipClass(type: string | null, types: string[]): string {
  if (!type) return 'chip-gray';
  const i = types.indexOf(type);
  return i === -1 ? 'chip-gray' : TYPE_CHIP_COLORS[i % TYPE_CHIP_COLORS.length];
}

export default function PublicationsPage() {
  const ctx = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const publications = publicationsStore.use();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [wpFilter, setWpFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Publication | null>(null);

  const dataInfo = useLocalDataInfo();

  // Deep link from citations: /publications?open=<id>
  useEffect(() => {
    const open = searchParams.get('open');
    if (open) {
      setSelectedId(open);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const types = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of publications) {
      if (p.type) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [publications]);

  const typeNames = useMemo(() => types.map(([t]) => t), [types]);

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
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (wpFilter !== 'all' && p.workPackage !== wpFilter) return false;
        if (!q) return true;
        return [p.title, p.firstAuthor, p.otherAuthors, p.outlet, p.workPackage, p.purpose]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      })
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }, [publications, query, typeFilter, wpFilter]);

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
    if (editing) publicationsStore.update(record);
    else publicationsStore.add(record);
    setSelectedId(record.id);
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
        subtitle={`2026 publication mastersheet · ${publications.length} outputs${dataInfo.label ? ` · ${dataInfo.label}` : ''}`}
        search={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search publications…"
            className="hidden sm:block"
          />
        }
        actions={
          <>
            <button
              type="button"
              onClick={openAdd}
              className="btn btn-secondary btn-sm"
              title="Add a publication"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
            <SpreadsheetImport kind="publications" />
          </>
        }
      />

      <div className="toolbar">
        <FilterChip
          active={typeFilter === 'all'}
          count={publications.length}
          onClick={() => setTypeFilter('all')}
        >
          All
        </FilterChip>
        {types.map(([type, count]) => (
          <FilterChip
            key={type}
            active={typeFilter === type}
            count={count}
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

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6 lg:py-8">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search publications…"
            className="sm:hidden mb-4 max-w-none"
          />

          <MetaSummary
            items={[
              { label: 'outputs in 2026', value: stats.total },
              { label: 'journal articles', value: stats.peerReviewed },
              { label: 'with link / DOI', value: stats.withLink },
            ]}
          />

          {publications.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No publications yet"
              description="Import the publication mastersheet or add outputs manually. Nexus uses this catalog to answer questions about what UNU-IIGH has published."
              action={
                <button type="button" onClick={openAdd} className="btn btn-primary btn-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Add a publication
                </button>
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
                  chipClass={typeChipClass(p.type, typeNames)}
                  active={selectedId === p.id}
                  onOpen={() => setSelectedId(p.id)}
                />
              ))}
            </ul>
          )}

          <div className="mt-10 text-[11px] text-gray-500 max-w-2xl">
            Publications feed into Nexus Chat — ask “what have we published on corporate
            accountability?” or “which outputs target policymakers?” and Nexus answers from
            this database. Import an updated mastersheet (.xlsx) any time.
          </div>
        </div>
      </div>

      {selected && (
        <PublicationDetail
          publication={selected}
          chipClass={typeChipClass(selected.type, typeNames)}
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
  const definition = p.type ? PUBLICATION_TYPE_DEFINITIONS[p.type] : undefined;
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
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {p.type && (
                <span className={classNames('chip text-[10px] py-0.5 px-1.5', chipClass)}>
                  {p.type}
                </span>
              )}
            </div>
            <div className="font-display font-semibold text-[17px] leading-snug">{p.title}</div>
            <div className="text-[13px] text-gray-600 mt-1">
              {[p.outlet, p.date ? formatDate(p.date) : null].filter(Boolean).join(' · ')}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-sm text-gray-400 hover:text-ink hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary w-full"
            >
              <ExternalLink className="w-4 h-4" />
              Open publication
            </a>
          )}

          {p.firstAuthor && <DetailRow icon={Users} label="First author" value={p.firstAuthor} />}
          {p.otherAuthors && (
            <DetailRow icon={Users} label="Other authors" value={p.otherAuthors} />
          )}
          {p.outlet && <DetailRow icon={Building2} label="Outlet / publisher" value={p.outlet} />}
          {p.workPackage && <DetailRow icon={Layers} label="Work package" value={p.workPackage} />}
          {p.targetAudience && (
            <DetailRow icon={Target} label="Target audience" value={p.targetAudience} />
          )}
          {p.purpose && <DetailRow icon={Globe2} label="Purpose" value={p.purpose} />}

          {definition && (
            <div className="callout text-[11px] text-gray-500 leading-relaxed">{definition}</div>
          )}
        </div>

        <div className="border-t border-rule p-4 bg-gray-50 shrink-0 space-y-2">
          <button type="button" onClick={onAskNexus} className="btn btn-primary w-full">
            <MessageSquare className="w-4 h-4" />
            Ask Nexus about this publication
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onEdit} className="btn btn-secondary flex-1 btn-sm">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="btn btn-ghost flex-1 btn-sm text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-sm bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">
          {label}
        </div>
        <div className="text-[13px] text-ink mt-0.5 whitespace-pre-wrap">{value}</div>
      </div>
    </div>
  );
}
