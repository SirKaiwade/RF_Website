import type {
  EventLevel,
  EventModality,
  EventType,
  IIGHEvent,
  Publication,
} from '../types';

/**
 * Shared spreadsheet → records logic. Used both by the seed generation script
 * (scripts/build-seeds.mjs) and the in-app "Import spreadsheet" flow, so the
 * mastersheets staff already maintain remain the single source of truth.
 */

export type Cell = string | number | boolean | Date | null | undefined;

export interface SheetTable {
  name: string;
  rows: Cell[][];
}

export interface ParseResult {
  events: IIGHEvent[];
  publications: Publication[];
  /** Sheets that didn't look like an events or publications table. */
  skippedSheets: string[];
}

const DEFAULT_YEAR = 2026;

// ---------- primitives ----------

function cellText(c: Cell): string | null {
  if (c == null) return null;
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  const s = String(c).replace(/\r\n/g, '\n').trim();
  return s.length ? s : null;
}

function cellNumber(c: Cell): number | null {
  if (typeof c === 'number' && Number.isFinite(c)) return c;
  const s = cellText(c);
  if (!s) return null;
  const n = parseFloat(s.replace(/[,%~]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function yesNo(c: Cell): boolean | null {
  const s = cellText(c);
  if (!s) return null;
  if (/^y/i.test(s)) return true;
  if (/^n/i.test(s)) return false;
  return null;
}

/** Percentages arrive as 0.9, 53, "~50%", "80" — normalize to 0–100. */
function percent(c: Cell): number | null {
  const n = cellNumber(c);
  if (n == null) return null;
  if (n <= 1) return Math.round(n * 100);
  if (n <= 100) return Math.round(n);
  return null;
}

function hashId(prefix: string, key: string): string {
  let h = 5381;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) + h + key.charCodeAt(i)) | 0;
  }
  return `${prefix}-${(h >>> 0).toString(36)}`;
}

// ---------- dates ----------

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function excelSerialToISO(n: number): string {
  const ms = Date.UTC(1899, 11, 30) + Math.round(n) * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Parses the free-text dates seen in the sheets: "20 January 2026",
 * "27-29 January 2026", "10 Feb 26", "23-24 February" (year implied),
 * "5-7 May (postponed-TBA)". Returns the first day of the range.
 */
function parseTextDate(raw: string): string | null {
  const m = raw.match(
    /(\d{1,2})(?:\s*[-–—]\s*\d{1,2})?\s+([A-Za-z]{3,})\.?,?\s*(\d{2,4})?/
  );
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = MONTHS[m[2].slice(0, 3).toLowerCase()];
  if (month == null || day < 1 || day > 31) return null;
  let year = m[3] ? parseInt(m[3], 10) : DEFAULT_YEAR;
  if (year < 100) year += 2000;
  return toISO(year, month, day);
}

export function parseDateCell(c: Cell): { date: string | null; note: string | null } {
  if (c == null) return { date: null, note: null };
  if (c instanceof Date) return { date: c.toISOString().slice(0, 10), note: null };
  if (typeof c === 'number') {
    // Excel serial dates for this era are ~45000–47000.
    if (c > 20000 && c < 60000) return { date: excelSerialToISO(c), note: null };
    return { date: null, note: String(c) };
  }
  const s = cellText(c);
  if (!s) return { date: null, note: null };
  const parsed = parseTextDate(s);
  const postponed = /postpon|tba|tbc/i.test(s);
  return {
    date: postponed ? null : parsed,
    // Keep the original wording when it carries more than a plain date.
    note: parsed && !postponed && /^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*$/.test(s) ? null : s,
  };
}

// ---------- normalizers ----------

export function normalizeEventType(c: Cell): EventType {
  const s = cellText(c)?.toLowerCase() ?? '';
  if (!s) return 'Other';
  if (s.includes('conference') || s.includes('symposium')) return 'Conference / Symposium';
  if (s.includes('webinar') || s.includes('seminar')) return 'Webinar / Seminar';
  if (s.includes('workshop') || s.includes('capacity')) return 'Workshop / Capacity strengthening';
  if (s.includes('policy') || s.includes('high-level')) return 'Policy dialogue / High-level dialogue';
  if (s.includes('consultation') || s.includes('roundtable')) return 'Consultation / Roundtable';
  if (s.includes('coordination') || s.includes('partnership')) return 'Coordination / Partnership meeting';
  if (s.includes('side')) return 'Side event';
  return 'Other';
}

export function normalizeModality(c: Cell): EventModality {
  const s = cellText(c)?.toLowerCase() ?? '';
  if (s.includes('hybrid')) return 'Hybrid';
  if (s.includes('virtual') || s.includes('online')) return 'Virtual';
  if (s.includes('person')) return 'In person';
  return 'Unspecified';
}

export function normalizeLevel(c: Cell): EventLevel {
  const s = cellText(c)?.toLowerCase() ?? '';
  if (s.includes('sub')) return 'Sub-national';
  if (s.includes('global') || s.includes('international')) return 'Global';
  if (s.includes('regional')) return 'Regional';
  if (s.includes('national')) return 'National';
  return 'Unspecified';
}

const PUB_TYPE_FIXUPS: Record<string, string> = {
  'website aticle': 'Website article',
};

function normalizePubType(c: Cell): string | null {
  const s = cellText(c);
  if (!s) return null;
  return PUB_TYPE_FIXUPS[s.toLowerCase()] ?? s;
}

// ---------- header mapping ----------

function normHeader(c: Cell): string {
  return (cellText(c) ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Finds the index of the first header matching any of the given substrings. */
function colIndex(headers: string[], ...needles: string[]): number {
  for (const needle of needles) {
    const i = headers.findIndex((h) => h.includes(needle));
    if (i !== -1) return i;
  }
  return -1;
}

function findHeaderRow(rows: Cell[][]): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const nonEmpty = rows[i].filter((c) => cellText(c)).length;
    if (nonEmpty >= 3) return i;
  }
  return -1;
}

// ---------- events ----------

function parseEventsSheet(rows: Cell[][], headerRow: number): IIGHEvent[] {
  const headers = rows[headerRow].map(normHeader);
  const col = {
    date: colIndex(headers, 'date'),
    title: colIndex(headers, 'event title', 'title'),
    description: colIndex(headers, 'event description', 'description'),
    type: colIndex(headers, 'event type'),
    purpose: colIndex(headers, 'strategic purpose'),
    workPackage: colIndex(headers, 'work package'),
    owner: colIndex(headers, 'event owner', 'owner'),
    partners: colIndex(headers, 'partners', 'co-convenors'),
    funder: colIndex(headers, 'funder', 'donor'),
    programme: colIndex(headers, 'programme', 'flagship'),
    location: colIndex(headers, 'location'),
    modality: colIndex(headers, 'modality'),
    level: colIndex(headers, 'event level', 'level'),
    total: colIndex(headers, 'total participants'),
    countries: colIndex(headers, 'countries represented'),
    gsCount: colIndex(headers, 'number of participants from global south'),
    gsPct: colIndex(headers, '% participants from global south'),
    femaleCount: colIndex(headers, 'number of female participants'),
    femalePct: colIndex(headers, '% female participants'),
    youth: colIndex(headers, 'youth participants'),
    southSouth: colIndex(headers, 'south-south'),
    outputs: colIndex(headers, 'key outputs'),
    fileLink: colIndex(headers, 'internal file link'),
    crossWp: colIndex(headers, 'cross-wp'),
    website: colIndex(headers, 'website article'),
    media: colIndex(headers, 'media coverage'),
    social: colIndex(headers, 'social media'),
    highLevel: colIndex(headers, 'high-level participants'),
  };

  const get = (row: Cell[], i: number): Cell => (i >= 0 ? row[i] : null);
  const events: IIGHEvent[] = [];

  for (const row of rows.slice(headerRow + 1)) {
    const title = cellText(get(row, col.title));
    if (!title) continue;
    const { date, note } = parseDateCell(get(row, col.date));
    events.push({
      id: hashId('ev', `${title.toLowerCase()}|${date ?? note ?? ''}`),
      title,
      description: cellText(get(row, col.description)),
      date,
      dateNote: note,
      type: normalizeEventType(get(row, col.type)),
      strategicPurpose: cellText(get(row, col.purpose)),
      workPackage: cellText(get(row, col.workPackage)),
      owner: cellText(get(row, col.owner)),
      partners: cellText(get(row, col.partners)),
      funder: cellText(get(row, col.funder)),
      programme: cellText(get(row, col.programme)),
      location: cellText(get(row, col.location)),
      modality: normalizeModality(get(row, col.modality)),
      level: normalizeLevel(get(row, col.level)),
      totalParticipants: cellNumber(get(row, col.total)),
      countriesRepresented: cellText(get(row, col.countries)),
      globalSouthParticipants: cellNumber(get(row, col.gsCount)),
      globalSouthPct: percent(get(row, col.gsPct)),
      femaleParticipants: cellNumber(get(row, col.femaleCount)),
      femalePct: percent(get(row, col.femalePct)),
      youthParticipants: cellNumber(get(row, col.youth)),
      southSouthExchange: yesNo(get(row, col.southSouth)),
      keyOutputs: cellText(get(row, col.outputs)),
      internalFileLink: cellText(get(row, col.fileLink)),
      crossWpCollaboration: cellText(get(row, col.crossWp)),
      websiteArticle: cellText(get(row, col.website)),
      mediaCoverage: cellText(get(row, col.media)),
      socialMedia: cellText(get(row, col.social)),
      highLevelParticipants: cellText(get(row, col.highLevel)),
    });
  }
  return events;
}

// ---------- publications ----------

function parsePublicationsSheet(rows: Cell[][], headerRow: number): Publication[] {
  const headers = rows[headerRow].map(normHeader);
  const col = {
    date: colIndex(headers, 'date'),
    title: colIndex(headers, 'title'),
    firstAuthor: colIndex(headers, 'first author'),
    otherAuthors: colIndex(headers, 'other authors'),
    type: colIndex(headers, 'publication type', 'type'),
    outlet: colIndex(headers, 'outlet', 'publisher'),
    link: colIndex(headers, 'link', 'doi'),
    workPackage: colIndex(headers, 'work package'),
    audience: colIndex(headers, 'target audience'),
    globalSouth: colIndex(headers, 'global south'),
    purpose: colIndex(headers, 'purpose'),
  };

  const get = (row: Cell[], i: number): Cell => (i >= 0 ? row[i] : null);
  const pubs: Publication[] = [];

  for (const row of rows.slice(headerRow + 1)) {
    const title = cellText(get(row, col.title))?.replace(/\n+/g, ' ');
    if (!title) continue;
    const { date } = parseDateCell(get(row, col.date));
    pubs.push({
      id: hashId('pub', title.toLowerCase()),
      title,
      date,
      firstAuthor: cellText(get(row, col.firstAuthor))?.replace(/\n+/g, ', ') ?? null,
      otherAuthors: cellText(get(row, col.otherAuthors))?.replace(/\n+/g, ', ') ?? null,
      type: normalizePubType(get(row, col.type)),
      outlet: cellText(get(row, col.outlet)),
      link: cellText(get(row, col.link)),
      workPackage: cellText(get(row, col.workPackage)),
      targetAudience: cellText(get(row, col.audience)),
      globalSouth: yesNo(get(row, col.globalSouth)),
      purpose: cellText(get(row, col.purpose)),
    });
  }
  return pubs;
}

// ---------- entry point ----------

function filledFieldCount(record: object): number {
  return Object.values(record).filter((v) => v != null).length;
}

/** The mastersheets occasionally repeat a row (e.g. an event listed under both
 * its work package and the Director section). Keep the richer record. */
function dedupeById<T extends { id: string }>(records: T[]): T[] {
  const byId = new Map<string, T>();
  for (const r of records) {
    const existing = byId.get(r.id);
    if (!existing || filledFieldCount(r) > filledFieldCount(existing)) {
      byId.set(r.id, r);
    }
  }
  return [...byId.values()];
}

export function parseTables(tables: SheetTable[]): ParseResult {
  const result: ParseResult = { events: [], publications: [], skippedSheets: [] };

  for (const table of tables) {
    const headerRow = findHeaderRow(table.rows);
    if (headerRow === -1) {
      result.skippedSheets.push(table.name);
      continue;
    }
    const headers = table.rows[headerRow].map(normHeader);
    const isEvents = headers.some((h) => h.includes('event title'));
    const isPubs =
      !isEvents &&
      headers.some((h) => h.includes('title')) &&
      (headers.some((h) => h.includes('publication type')) ||
        headers.some((h) => h.includes('first author')));

    if (isEvents) {
      result.events.push(...parseEventsSheet(table.rows, headerRow));
    } else if (isPubs) {
      result.publications.push(...parsePublicationsSheet(table.rows, headerRow));
    } else {
      result.skippedSheets.push(table.name);
    }
  }
  result.events = dedupeById(result.events);
  result.publications = dedupeById(result.publications);
  return result;
}
