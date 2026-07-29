import { useRef, useState } from 'react';
import { FileSpreadsheet, Loader2, RotateCcw, Upload, X } from 'lucide-react';
import { parseTables, type ParseResult } from '../lib/recordsImport';
import { isSpreadsheetFile, readSpreadsheet } from '../lib/spreadsheet';
import { eventsStore } from '../data/events';
import { publicationsStore } from '../data/publications';

interface Props {
  /** Which record type this page is about — only affects copy. */
  kind: 'events' | 'publications';
}

interface PendingImport {
  filename: string;
  result: ParseResult;
}

/**
 * Lets staff re-import the events matrix / publication mastersheet they
 * already maintain. Parses in the browser, previews what will change, then
 * merges into the local stores (imported rows win by id).
 */
export default function SpreadsheetImport({ kind }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const label = kind === 'events' ? 'events matrix' : 'publication mastersheet';

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setNote(null);
    if (!isSpreadsheetFile(file)) {
      setError(`${file.name} is not a spreadsheet. Use .xlsx, .xls, or .csv.`);
      return;
    }
    setBusy(true);
    try {
      const tables = await readSpreadsheet(file);
      const result = parseTables(tables);
      if (result.events.length === 0 && result.publications.length === 0) {
        setError(
          `No events or publications found in ${file.name}. Expected the mastersheet column headers (e.g. "Event title" or "Publication type").`
        );
      } else {
        setPending({ filename: file.name, result });
      }
    } catch (err) {
      setError(
        `Could not read ${file.name}: ${err instanceof Error ? err.message : 'unknown error'}`
      );
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function confirmImport() {
    if (!pending) return;
    const parts: string[] = [];
    if (pending.result.events.length > 0) {
      const s = eventsStore.merge(pending.result.events);
      parts.push(`${s.added} new + ${s.updated} updated events`);
    }
    if (pending.result.publications.length > 0) {
      const s = publicationsStore.merge(pending.result.publications);
      parts.push(`${s.added} new + ${s.updated} updated publications`);
    }
    setNote(`Imported from ${pending.filename}: ${parts.join(', ')}.`);
    setPending(null);
  }

  function resetData() {
    if (kind === 'events') eventsStore.reset();
    else publicationsStore.reset();
    setNote('Restored the bundled mastersheet data.');
  }

  const hasImports =
    kind === 'events' ? eventsStore.hasImports() : publicationsStore.hasImports();

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
        title={`Import an updated ${label} (.xlsx/.csv)`}
        className="btn btn-secondary btn-sm"
      >
        {busy ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        Import
      </button>
      {hasImports && (
        <button
          type="button"
          onClick={resetData}
          title="Discard imported data and restore the bundled mastersheet"
          className="btn btn-ghost btn-sm text-gray-500"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {(note || error) && (
        <div
          className={
            error
              ? 'fixed bottom-4 right-4 z-50 max-w-sm rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-900 shadow-elevated fade-in'
              : 'fixed bottom-4 right-4 z-50 max-w-sm rounded-sm border border-un-blue-soft bg-un-blue-bg px-4 py-3 text-[13px] text-un-blue-dark shadow-elevated fade-in'
          }
        >
          <div className="flex items-start gap-2">
            <span className="flex-1">{error ?? note}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => {
                setError(null);
                setNote(null);
              }}
              className="p-0.5 rounded-sm hover:bg-surface/60 text-current shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {pending && (
        <>
          <button
            type="button"
            aria-label="Cancel import"
            className="fixed inset-0 z-40 bg-ink/30"
            onClick={() => setPending(null)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface border border-rule rounded-sm shadow-elevated fade-in">
            <div className="px-5 py-4 border-b border-rule flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-un-blue-bg text-un-blue flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-semibold text-[15px]">Confirm import</div>
                <div className="text-[12px] text-gray-500 truncate" title={pending.filename}>
                  {pending.filename}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 text-[13px] text-gray-700 space-y-2">
              {pending.result.events.length > 0 && (
                <div>
                  <strong>{pending.result.events.length}</strong> event
                  {pending.result.events.length === 1 ? '' : 's'} found — rows matching an
                  existing event (same title and date) will be updated, the rest added.
                </div>
              )}
              {pending.result.publications.length > 0 && (
                <div>
                  <strong>{pending.result.publications.length}</strong> publication
                  {pending.result.publications.length === 1 ? '' : 's'} found — rows matching
                  an existing title will be updated, the rest added.
                </div>
              )}
              <div className="text-[12px] text-gray-500">
                Changes are saved to your local data folder when running the dev server
                (data/local/*.json). You can restore the bundled mastersheet at any time.
              </div>
            </div>
            <div className="px-5 py-3 border-t border-rule flex items-center justify-end gap-2 bg-gray-50">
              <button type="button" onClick={() => setPending(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
              <button type="button" onClick={confirmImport} className="btn btn-primary btn-sm">
                Import
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
