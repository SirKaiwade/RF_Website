import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, ChevronDown } from 'lucide-react';
import type { Publication } from '../types';
import {
  PUBLICATION_TYPE_DEFINITIONS,
  PUBLICATION_TYPES,
  publicationsStore,
} from '../data/publications';
import {
  emptyPublicationRow,
  publicationGridColumns,
  publicationsFromClipboard,
  publicationsToTsv,
} from '../lib/publicationsGrid';
import RecordsGrid from './RecordsGrid';
import SpreadsheetImport from './SpreadsheetImport';
import { useLocalDataInfo } from '../lib/localDataSync';
import { classNames } from '../lib/format';
import type { ShellContext } from './AppShell';
import { FilterChip, MetaSummary, PageHeader, SearchField } from './ui';

export default function PublicationsPage() {
  const ctx = useOutletContext<ShellContext>();
  const publications = publicationsStore.use();
  const dataInfo = useLocalDataInfo();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [wpFilter, setWpFilter] = useState<string>('all');

  const types = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of publications) {
      if (p.type) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
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
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (wpFilter !== 'all' && p.workPackage !== wpFilter) return false;
        if (!q) return true;
        return [p.title, p.firstAuthor, p.otherAuthors, p.outlet, p.workPackage, p.purpose]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      })
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title));
  }, [publications, query, typeFilter, wpFilter]);

  // When filters are active, edit the filtered view but write through by id.
  function updateRow(row: Publication) {
    publicationsStore.update(row);
  }

  function replaceAll(rows: Publication[]) {
    publicationsStore.hydrate(rows);
  }

  function addRow() {
    publicationsStore.add(emptyPublicationRow());
  }

  function deleteRow(id: string) {
    publicationsStore.remove(id);
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
        subtitle={`Editable mastersheet · ${publications.length} outputs${dataInfo.label ? ` · ${dataInfo.label}` : ''}`}
        search={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Filter rows…"
            className="hidden sm:block"
          />
        }
        actions={<SpreadsheetImport kind="publications" />}
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

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-5 lg:py-6 space-y-4">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Filter rows…"
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

          <RecordsGrid
            rows={filtered}
            columns={publicationGridColumns}
            onReplace={replaceAll}
            onUpdate={updateRow}
            onAddRow={addRow}
            onDeleteRow={deleteRow}
            parsePaste={publicationsFromClipboard}
            serializeCopy={publicationsToTsv}
            emptyLabel="No publications yet — paste your mastersheet here (include the header row), or add a row."
            pasteHint="Click the table, then paste from Excel/Sheets (with headers). Edit any cell; Copy sends the table back out."
          />

          {(typeFilter !== 'all' || wpFilter !== 'all' || query.trim()) &&
            filtered.length !== publications.length && (
              <p className="text-[11px] text-gray-500">
                Showing {filtered.length} of {publications.length} rows (filters applied). Paste
                still replaces the full dataset.
              </p>
            )}
        </div>
      </div>
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
            How each categorization is defined for this mastersheet
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
