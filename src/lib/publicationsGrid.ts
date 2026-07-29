import type { Publication } from '../types';
import { PUBLICATION_TYPES } from '../data/publications';
import { makeRecordId } from './recordId';
import {
  findHeaderRow,
  parseDateCell,
  parsePublicationsSheet,
  type Cell,
} from './recordsImport';
import { parseClipboardMatrix, toTsv } from './clipboardTable';
import type { GridColumn } from '../components/RecordsGrid';

export const PUBLICATION_GRID_HEADERS = [
  'Date',
  'Title',
  'First author',
  'Other authors',
  'Publication type',
  'Outlet/Publisher',
  'Link / DOI',
  'Work Package',
  'Target audience',
  'Global South',
  'Purpose',
] as const;

function boolToCell(v: boolean | null): string {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '';
}

function cellToBool(raw: string): boolean | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^y/i.test(s) || s === '1' || /^true$/i.test(s)) return true;
  if (/^n/i.test(s) || s === '0' || /^false$/i.test(s)) return false;
  return null;
}

export const publicationGridColumns: GridColumn<Publication>[] = [
  {
    id: 'date',
    header: 'Date',
    width: 120,
    input: 'date',
    getValue: (r) => r.date ?? '',
    setValue: (r, v) => ({ ...r, date: v.trim() || null }),
  },
  {
    id: 'title',
    header: 'Title',
    width: 280,
    getValue: (r) => r.title,
    setValue: (r, v) => ({ ...r, title: v.replace(/\n+/g, ' ').trim() }),
  },
  {
    id: 'firstAuthor',
    header: 'First author',
    width: 140,
    getValue: (r) => r.firstAuthor ?? '',
    setValue: (r, v) => ({ ...r, firstAuthor: v.trim() || null }),
  },
  {
    id: 'otherAuthors',
    header: 'Other authors',
    width: 180,
    getValue: (r) => r.otherAuthors ?? '',
    setValue: (r, v) => ({ ...r, otherAuthors: v.trim() || null }),
  },
  {
    id: 'type',
    header: 'Publication type',
    width: 170,
    input: 'select',
    options: [...PUBLICATION_TYPES],
    getValue: (r) => r.type ?? '',
    setValue: (r, v) => ({ ...r, type: v.trim() || null }),
  },
  {
    id: 'outlet',
    header: 'Outlet/Publisher',
    width: 160,
    getValue: (r) => r.outlet ?? '',
    setValue: (r, v) => ({ ...r, outlet: v.trim() || null }),
  },
  {
    id: 'link',
    header: 'Link / DOI',
    width: 200,
    getValue: (r) => r.link ?? '',
    setValue: (r, v) => ({ ...r, link: v.trim() || null }),
  },
  {
    id: 'workPackage',
    header: 'Work Package',
    width: 140,
    getValue: (r) => r.workPackage ?? '',
    setValue: (r, v) => ({ ...r, workPackage: v.trim() || null }),
  },
  {
    id: 'targetAudience',
    header: 'Target audience',
    width: 140,
    getValue: (r) => r.targetAudience ?? '',
    setValue: (r, v) => ({ ...r, targetAudience: v.trim() || null }),
  },
  {
    id: 'globalSouth',
    header: 'Global South',
    width: 110,
    input: 'select',
    options: ['', 'Yes', 'No'],
    getValue: (r) => boolToCell(r.globalSouth),
    setValue: (r, v) => ({ ...r, globalSouth: cellToBool(v) }),
  },
  {
    id: 'purpose',
    header: 'Purpose',
    width: 240,
    getValue: (r) => r.purpose ?? '',
    setValue: (r, v) => ({ ...r, purpose: v.trim() || null }),
  },
];

export function emptyPublicationRow(): Publication {
  return {
    id: makeRecordId('pub', `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    title: '',
    date: null,
    firstAuthor: null,
    otherAuthors: null,
    type: null,
    outlet: null,
    link: null,
    workPackage: null,
    targetAudience: null,
    globalSouth: null,
    purpose: null,
  };
}

export function publicationsToTsv(rows: Publication[]): string {
  const body = rows.map((r) => publicationGridColumns.map((c) => c.getValue(r)));
  return toTsv([[...PUBLICATION_GRID_HEADERS], ...body]);
}

/**
 * Parse a pasted mastersheet (with or without header row) into publications.
 * Prefer the shared sheet parser when a header row is present.
 */
export function publicationsFromClipboard(text: string): Publication[] {
  const matrix = parseClipboardMatrix(text);
  if (matrix.length === 0) return [];

  const asCells: Cell[][] = matrix.map((row) => row.map((c) => c));
  const headerRow = findHeaderRow(asCells);
  if (headerRow !== -1) {
    const headers = matrix[headerRow].map((h) => h.toLowerCase());
    const looksLikePubs =
      headers.some((h) => h.includes('title')) &&
      (headers.some((h) => h.includes('publication type')) ||
        headers.some((h) => h.includes('first author')) ||
        headers.some((h) => h.includes('outlet')));
    if (looksLikePubs) {
      return parsePublicationsSheet(asCells, headerRow).filter((p) => p.title.trim());
    }
  }

  // No header — assume canonical column order and treat every row as data.
  return matrix
    .map((row) => rowFromCanonical(row))
    .filter((p) => p.title.trim());
}

function rowFromCanonical(row: string[]): Publication {
  const g = (i: number) => (row[i] ?? '').trim();
  const title = g(1).replace(/\n+/g, ' ');
  const { date } = parseDateCell(g(0) || null);
  return {
    id: title
      ? makeRecordId('pub', title.toLowerCase())
      : makeRecordId('pub', `paste-${Math.random().toString(36).slice(2)}`),
    title,
    date,
    firstAuthor: g(2).replace(/\n+/g, ', ') || null,
    otherAuthors: g(3).replace(/\n+/g, ', ') || null,
    type: g(4) || null,
    outlet: g(5) || null,
    link: g(6) || null,
    workPackage: g(7) || null,
    targetAudience: g(8) || null,
    globalSouth: cellToBool(g(9)),
    purpose: g(10) || null,
  };
}
