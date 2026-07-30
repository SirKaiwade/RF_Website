import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  ChevronDown,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import type { Publication } from '../types';
import {
  formatAuthors,
  getPublication,
  PUBLICATION_TYPE_DEFINITIONS,
  PUBLICATION_TYPES,
  publicationsStore,
} from '../data/publications';
import SpreadsheetImport from './SpreadsheetImport';
import InlineEditField from './InlineEditField';
import { useLocalDataInfo } from '../lib/localDataSync';
import { classNames, formatDate } from '../lib/format';
import type { ShellContext } from './AppShell';
import { EmptyState, FilterChip, MetaSummary, PageHeader, SearchField } from './ui';
import { makeRecordId } from '../lib/recordId';
import { emptyPublication } from '../lib/recordTemplates';

const TYPE_CHIP_COLORS = ['chip-blue', 'chip-green', 'chip-amber', 'chip-teal', 'chip-red'];

function typeChipClass(type: string | null): string {
  if (!type) return 'chip-gray';
  const i = PUBLICATION_TYPES.indexOf(type as (typeof PUBLICATION_TYPES)[number]);
  return i === -1 ? 'chip-gray' : TYPE_CHIP_COLORS[i % TYPE_CHIP_COLORS.length];
}

export default function PublicationsPage() {
  const ctx = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const publications = publicationsStore.use();
  const dataInfo = useLocalDataInfo();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const open = searchParams.get('open');
    if (open) {
      setSelectedId(open);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of PUBLICATION_TYPES) counts.set(t, 0);
    for (const p of publications) {
      if (p.type) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    }
    return counts;
  }, [publications]);

  const filterTypes = useMemo(() => {
    // Canonical key order first, then any leftover imported labels
    const extras = [...typeCounts.keys()].filter(
      (t) => !(PUBLICATION_TYPES as readonly string[]).includes(t) && (typeCounts.get(t) ?? 0) > 0
    );
    return [...PUBLICATION_TYPES, ...extras.sort()];
  }, [typeCounts]);

  const stats = useMemo(() => {
    const peerReviewed = publications.filter((p) => p.type === 'Journal article').length;
    const withLink = publications.filter((p) => p.link).length;
    return {
      total: publications.filter((p) => p.title.trim()).length,
      peerReviewed,
      withLink,
    };
  }, [publications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications
      .filter((p) => {
        if (!p.title.trim()) return false;
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (!q) return true;
        return [p.title, p.firstAuthor, p.otherAuthors, p.outlet, p.purpose, p.type]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      })
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title));
  }, [publications, query, typeFilter]);

  const selected = selectedId ? getPublication(selectedId) ?? null : null;

  function askNexusAbout(p: Publication) {
    ctx.sendMessage(`What do we know about the publication "${p.title}"?`);
    navigate('/');
  }

  function patchPublication(id: string, patch: Partial<Publication>) {
    const current = getPublication(id);
    if (!current) return;
    publicationsStore.update({ ...current, ...patch });
  }

  function addBlank() {
    const blank = {
      ...emptyPublication(),
      id: makeRecordId('pub', `new-${Date.now()}`),
      title: 'Untitled publication',
    };
    publicationsStore.add(blank);
    setSelectedId(blank.id);
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
        subtitle={`${stats.total} outputs${dataInfo.label ? ` · ${dataInfo.label}` : ''}`}
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
            <button type="button" onClick={addBlank} className="btn btn-secondary btn-sm">
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
          count={stats.total}
          onClick={() => setTypeFilter('all')}
        >
          All
        </FilterChip>
        {filterTypes.map((type) => (
          <FilterChip
            key={type}
            active={typeFilter === type}
            count={typeCounts.get(type) ?? 0}
            onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
          >
            {type}
          </FilterChip>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-5 lg:py-6 space-y-4">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search publications…"
            className="sm:hidden max-w-none"
          />

          <MetaSummary
            items={[
              { label: 'outputs', value: stats.total },
              { label: 'journal articles', value: stats.peerReviewed },
              { label: 'with link / DOI', value: stats.withLink },
            ]}
          />

          <PublicationTypeKey />

          {stats.total === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No publications yet"
              description="Import your publications workbook (.xlsx). Nothing is hardcoded — load 2023–2025 from scratch. Double-click any field to edit; changes save automatically."
              action={<SpreadsheetImport kind="publications" />}
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

      {selected && (
        <PublicationDetail
          publication={selected}
          chipClass={typeChipClass(selected.type)}
          onClose={() => setSelectedId(null)}
          onAskNexus={() => askNexusAbout(selected)}
          onPatch={(patch) => patchPublication(selected.id, patch)}
          onDelete={() => deletePublication(selected)}
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
  onPatch,
  onDelete,
}: {
  publication: Publication;
  chipClass: string;
  onClose: () => void;
  onAskNexus: () => void;
  onPatch: (patch: Partial<Publication>) => void;
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
            <h2 className="text-[16px] font-semibold text-ink leading-snug">
              <InlineEditField
                value={p.title}
                onSave={(title) => onPatch({ title: title || p.title })}
              />
            </h2>
            {definition && (
              <p className="mt-2 text-[12px] text-gray-500 leading-snug">{definition}</p>
            )}
            <p className="mt-2 text-[11px] text-gray-400">Double-click any field to edit · autosaves</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 text-[13px]">
          <InlineEditField
            label="Date"
            type="date"
            value={p.date ?? ''}
            onSave={(date) => onPatch({ date: date || null })}
          />
          <InlineEditField
            label="Type"
            value={p.type ?? ''}
            onSave={(type) => onPatch({ type: type || null })}
          />
          <InlineEditField
            label="First author"
            value={p.firstAuthor ?? ''}
            onSave={(firstAuthor) => onPatch({ firstAuthor: firstAuthor || null })}
          />
          <InlineEditField
            label="Other authors"
            value={p.otherAuthors ?? ''}
            onSave={(otherAuthors) => onPatch({ otherAuthors: otherAuthors || null })}
          />
          <InlineEditField
            label="Outlet / publisher"
            value={p.outlet ?? ''}
            onSave={(outlet) => onPatch({ outlet: outlet || null })}
          />
          <InlineEditField
            label="Link / DOI"
            value={p.link ?? ''}
            onSave={(link) => onPatch({ link: link || null })}
          />
          <InlineEditField
            label="Work package"
            value={p.workPackage ?? ''}
            onSave={(workPackage) => onPatch({ workPackage: workPackage || null })}
          />
          <InlineEditField
            label="Target audience"
            value={p.targetAudience ?? ''}
            onSave={(targetAudience) => onPatch({ targetAudience: targetAudience || null })}
          />
          <InlineEditField
            label="Purpose"
            value={p.purpose ?? ''}
            multiline
            onSave={(purpose) => onPatch({ purpose: purpose || null })}
          />
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-un-blue hover:underline mt-3"
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
          <button type="button" onClick={onDelete} className="btn btn-ghost btn-sm text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </aside>
    </>
  );
}
