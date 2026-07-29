import { useCallback, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { ClipboardPaste, Copy, Plus, Trash2 } from 'lucide-react';
import { classNames } from '../lib/format';

export interface GridColumn<T extends { id: string }> {
  id: string;
  header: string;
  width?: number;
  input?: 'text' | 'date' | 'select';
  options?: readonly string[];
  getValue: (row: T) => string;
  setValue: (row: T, value: string) => T;
}

interface Props<T extends { id: string }> {
  rows: T[];
  columns: GridColumn<T>[];
  /** Commit a full replacement of the dataset (paste / bulk). */
  onReplace: (rows: T[]) => void;
  /** Update one existing row in place. */
  onUpdate: (row: T) => void;
  /** Append a blank row. */
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  /** Parse clipboard text into records (header-aware). */
  parsePaste: (text: string) => T[];
  /** Serialize current rows for copy-back to Excel. */
  serializeCopy: (rows: T[]) => string;
  emptyLabel?: string;
  pasteHint?: string;
}

/**
 * Spreadsheet-style editor: cell editing, Excel paste/copy, add/delete rows.
 * Designed so Publications / Events / Directory can share the same shell.
 */
export default function RecordsGrid<T extends { id: string }>({
  rows,
  columns,
  onReplace,
  onUpdate,
  onAddRow,
  onDeleteRow,
  parsePaste,
  serializeCopy,
  emptyLabel = 'No rows yet',
  pasteHint = 'Paste from Excel (⌘V / Ctrl+V) — include the header row',
}: Props<T>) {
  const [active, setActive] = useState<{ rowId: string; colId: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [flash, setFlash] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const showFlash = useCallback((msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 3200);
  }, []);

  function startEdit(row: T, col: GridColumn<T>) {
    setActive({ rowId: row.id, colId: col.id });
    setDraft(col.getValue(row));
  }

  function commitEdit(row: T, col: GridColumn<T>, value: string) {
    const next = col.setValue(row, value);
    if (col.getValue(row) !== col.getValue(next)) onUpdate(next);
    setActive(null);
  }

  function cancelEdit() {
    setActive(null);
  }

  function handlePaste(e: ClipboardEvent) {
    const text = e.clipboardData.getData('text/plain');
    if (!text || (!text.includes('\t') && !text.includes('\n'))) {
      // Single-cell paste into an active editor — let the input handle it.
      return;
    }
    e.preventDefault();
    const parsed = parsePaste(text);
    if (parsed.length === 0) {
      showFlash('Nothing usable found in the paste. Include the header row from your sheet.');
      return;
    }
    if (
      rows.length > 0 &&
      !window.confirm(
        `Replace ${rows.length} existing row${rows.length === 1 ? '' : 's'} with ${parsed.length} pasted row${parsed.length === 1 ? '' : 's'}?`
      )
    ) {
      return;
    }
    onReplace(parsed);
    showFlash(`Loaded ${parsed.length} row${parsed.length === 1 ? '' : 's'} from clipboard.`);
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(serializeCopy(rows));
      showFlash('Copied table (with headers) — paste into Excel or Sheets.');
    } catch {
      showFlash('Could not copy to clipboard.');
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c' && !active) {
      // Native selection copy still works; this covers “copy whole table”.
      if (window.getSelection()?.toString()) return;
      e.preventDefault();
      void copyAll();
    }
  }

  return (
    <div className="records-grid" onPaste={handlePaste} onKeyDown={onKeyDown} tabIndex={0} ref={tableRef}>
      <div className="records-grid-toolbar">
        <p className="records-grid-hint">{pasteHint}</p>
        <div className="flex items-center gap-2 shrink-0">
          {flash && <span className="records-grid-flash">{flash}</span>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void copyAll()} title="Copy table as TSV">
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              tableRef.current?.focus();
              showFlash('Click the table, then paste (⌘V / Ctrl+V).');
            }}
            title="Focus table for paste"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            Paste
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onAddRow}>
            <Plus className="w-3.5 h-3.5" />
            Add row
          </button>
        </div>
      </div>

      <div className="records-grid-scroll">
        <table className="records-grid-table">
          <thead>
            <tr>
              <th className="records-grid-rownum">#</th>
              {columns.map((col) => (
                <th key={col.id} style={col.width ? { minWidth: col.width } : undefined}>
                  {col.header}
                </th>
              ))}
              <th className="records-grid-actions" aria-label="Row actions" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="records-grid-empty">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="records-grid-rownum">{idx + 1}</td>
                  {columns.map((col) => {
                    const isEditing = active?.rowId === row.id && active?.colId === col.id;
                    const value = col.getValue(row);
                    return (
                      <td
                        key={col.id}
                        className={classNames(isEditing && 'is-editing')}
                        onDoubleClick={() => startEdit(row, col)}
                      >
                        {isEditing ? (
                          col.input === 'select' && col.options ? (
                            <select
                              className="records-grid-input"
                              autoFocus
                              value={draft}
                              onChange={(e) => {
                                commitEdit(row, col, e.target.value);
                              }}
                              onBlur={() => cancelEdit()}
                            >
                              {col.options.map((opt) => (
                                <option key={opt || '(blank)'} value={opt}>
                                  {opt || '—'}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className="records-grid-input"
                              type={col.input === 'date' ? 'date' : 'text'}
                              autoFocus
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onBlur={() => commitEdit(row, col, draft)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  commitEdit(row, col, draft);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelEdit();
                                }
                              }}
                            />
                          )
                        ) : (
                          <button
                            type="button"
                            className="records-grid-cell"
                            onClick={() => startEdit(row, col)}
                            title="Click to edit"
                          >
                            {value || <span className="text-gray-300">—</span>}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="records-grid-actions">
                    <button
                      type="button"
                      className="records-grid-delete"
                      aria-label="Delete row"
                      title="Delete row"
                      onClick={() => {
                        if (window.confirm('Delete this row?')) onDeleteRow(row.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
