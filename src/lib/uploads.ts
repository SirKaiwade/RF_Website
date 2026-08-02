import { useSyncExternalStore } from 'react';
import { isSpreadsheetFile, readSpreadsheet, sheetsToText } from './spreadsheet';

export type DocSource = 'upload' | 'local' | 'sharepoint';

export interface UploadedDoc {
  id: string;
  filename: string;
  bytes: number;
  uploadedAt: string;
  text: string;
  pageCount?: number;
  charCount: number;
  /** First-page thumbnail (data URL) when available — currently PDFs. */
  previewUrl?: string;
  source?: DocSource;
  /** Stable key for docs synced from a local folder (path + modified time). */
  localFileKey?: string;
  /** Path within the local library folder, e.g. "reports/q1.pdf". */
  localRelativePath?: string;
  /** True once this doc is saved to the shared Supabase library (visible to all staff). */
  shared?: boolean;
}

// Soft caps. Per-doc, we trim to ~80k chars (~20k tokens). Total library cap is ~250k chars
// so the corpus prompt stays well under the model's context window even with seed docs.
const MAX_PER_DOC_CHARS = 80_000;
export const MAX_TOTAL_UPLOADED_CHARS = 250_000;

const STORAGE_KEY = 'nexus:library-docs';

let store: UploadedDoc[] = loadFromLocalStorage();
const listeners = new Set<() => void>();

function loadFromLocalStorage(): UploadedDoc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (d): d is UploadedDoc =>
          !!d &&
          typeof d === 'object' &&
          typeof (d as UploadedDoc).id === 'string' &&
          typeof (d as UploadedDoc).filename === 'string' &&
          typeof (d as UploadedDoc).text === 'string'
      )
      .map((d) => ({
        ...d,
        bytes: typeof d.bytes === 'number' ? d.bytes : d.text.length,
        charCount: typeof d.charCount === 'number' ? d.charCount : d.text.length,
        uploadedAt: d.uploadedAt || new Date().toISOString(),
        // Every file needs a pin-pointable path (at least the filename).
        localRelativePath:
          typeof d.localRelativePath === 'string' && d.localRelativePath.trim()
            ? d.localRelativePath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
            : d.filename,
        // Previews are large data URLs — not restored from disk.
        previewUrl: undefined,
      }));
  } catch {
    return [];
  }
}

/** Persist text + metadata. Skip previewUrl to stay under localStorage quotas. */
function persistToLocalStorage(): void {
  try {
    const slim = store.map(({ previewUrl: _preview, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch (err) {
    console.warn(
      '[Nexus] Could not persist library to localStorage:',
      err instanceof Error ? err.message : err
    );
  }
}

function notify() {
  persistToLocalStorage();
  listeners.forEach((l) => l());
}

function emitSnapshot(): UploadedDoc[] {
  return store;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUploadedDocs(): UploadedDoc[] {
  return useSyncExternalStore(subscribe, emitSnapshot, emitSnapshot);
}

export function getUploadedDocs(): UploadedDoc[] {
  return store;
}

export function totalUploadedChars(): number {
  return store.reduce((sum, d) => sum + d.charCount, 0);
}

export function removeUploadedDoc(id: string): void {
  store = store.filter((d) => d.id !== id);
  notify();
  void import('./db/library').then(({ removeDocumentFromLibrary }) =>
    removeDocumentFromLibrary(id)
  );
}

export function removeUploadedDocByLocalKey(localFileKey: string): void {
  const removed = store.filter((d) => d.localFileKey === localFileKey);
  store = store.filter((d) => d.localFileKey !== localFileKey);
  notify();
  if (removed.length === 0) return;
  void import('./db/library').then(({ removeDocumentFromLibrary }) => {
    for (const d of removed) void removeDocumentFromLibrary(d.id);
  });
}

export function getLocalSyncedDocs(): UploadedDoc[] {
  return store.filter((d) => d.source === 'local' && d.localFileKey);
}

export function clearUploadedDocs(): void {
  const ids = store.map((d) => d.id);
  store = [];
  notify();
  void import('./db/library').then(({ removeDocumentFromLibrary }) => {
    for (const id of ids) void removeDocumentFromLibrary(id);
  });
}

/** Merge documents loaded from the shared Supabase library into the durable store. */
export function hydrateSharedDocs(docs: UploadedDoc[]): void {
  if (docs.length === 0) return;
  const byId = new Map(store.map((d) => [d.id, d]));
  for (const incoming of docs) {
    const existing = byId.get(incoming.id);
    if (!existing) {
      byId.set(incoming.id, {
        ...incoming,
        shared: true,
        localRelativePath: incoming.localRelativePath || incoming.filename,
      });
      continue;
    }
    // Prefer the longer text body; always mark cloud-backed docs as shared.
    const text =
      (incoming.text?.length ?? 0) > (existing.text?.length ?? 0)
        ? incoming.text
        : existing.text;
    byId.set(incoming.id, {
      ...existing,
      ...incoming,
      text,
      charCount: text.length,
      shared: true,
      localRelativePath:
        incoming.localRelativePath ||
        existing.localRelativePath ||
        incoming.filename ||
        existing.filename,
      previewUrl: existing.previewUrl ?? incoming.previewUrl,
    });
  }
  store = [...byId.values()].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  notify();
}

/** Flip a doc's `shared` flag after it's been successfully saved to the shared library. */
export function markDocShared(id: string): void {
  store = store.map((d) => (d.id === id ? { ...d, shared: true } : d));
  notify();
}

/** Push any docs that are only local up to Supabase (e.g. after refresh / offline upload). */
export async function syncUnsharedDocsToCloud(
  uploaderEmail: string
): Promise<void> {
  const pending = store.filter((d) => !d.shared);
  if (pending.length === 0) return;
  for (const doc of pending) {
    await persistDocToCloud(doc, uploaderEmail);
  }
}

function uid(): string {
  return `up-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36).slice(-4)}`;
}

let pdfjsWorkerConfigured = false;

async function ensurePdfjs() {
  const [pdfjs, { default: workerUrl }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.mjs?url'),
  ]);
  if (!pdfjsWorkerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    pdfjsWorkerConfigured = true;
  }
  return pdfjs;
}

async function extractPdfTextAndPreview(
  file: File
): Promise<{ text: string; pageCount: number; previewUrl?: string }> {
  // Dynamically imported — pdf.js (plus its worker chunk) only downloads
  // when someone actually uploads a PDF, not on every authenticated page load.
  const pdfjs = await ensurePdfjs();

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) pages.push(`-- page ${i} --\n${text}`);
  }

  let previewUrl: string | undefined;
  try {
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(220 / base.width, 2.4);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // pdfjs v4 uses `canvas` in the render params; keep canvasContext for older typings.
      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      } as Parameters<typeof page.render>[0]).promise;
      previewUrl = canvas.toDataURL('image/jpeg', 0.78);
    }
  } catch {
    // Preview is optional — text extraction already succeeded.
  }

  return { text: pages.join('\n\n'), pageCount: pdf.numPages, previewUrl };
}

async function extractPlainText(file: File): Promise<string> {
  return file.text();
}

async function extractDocxText(file: File): Promise<string> {
  const { default: mammoth } = await import('mammoth/mammoth.browser');
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
}

export interface UploadResult {
  ok: boolean;
  doc?: UploadedDoc;
  error?: string;
}

export interface IngestMeta {
  source?: DocSource;
  localFileKey?: string;
  localRelativePath?: string;
}

/** Prefer explicit meta, then browser folder-upload path (webkitRelativePath).
 *  Always returns a path — at minimum the filename — so every file is pin-pointable.
 */
function resolveRelativePath(
  file: File,
  meta?: IngestMeta,
  destinationFolder?: string
): string {
  if (meta?.localRelativePath) {
    return meta.localRelativePath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  }
  const webkit = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  if (webkit && webkit.includes('/')) {
    return webkit.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  }
  const dest = (destinationFolder ?? '')
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');
  return dest ? `${dest}/${file.name}` : file.name;
}

export async function ingestFile(
  file: File,
  meta?: IngestMeta,
  destinationFolder?: string
): Promise<UploadResult> {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
  const isDocx =
    name.endsWith('.docx') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isSheet = isSpreadsheetFile(file);
  const isText =
    !isSheet &&
    (name.endsWith('.txt') ||
      name.endsWith('.md') ||
      name.endsWith('.markdown') ||
      file.type.startsWith('text/'));

  if (!isPdf && !isDocx && !isText && !isSheet) {
    return {
      ok: false,
      error: `Unsupported file type: ${file.name}. Try PDF, Word (.docx), Excel (.xlsx/.csv), or .txt/.md.`,
    };
  }

  if (file.size > 25 * 1024 * 1024) {
    return {
      ok: false,
      error: `${file.name} is over 25 MB. Trim it or split it before uploading.`,
    };
  }

  let text = '';
  let pageCount: number | undefined;
  let previewUrl: string | undefined;

  try {
    if (isPdf) {
      const extracted = await extractPdfTextAndPreview(file);
      text = extracted.text;
      pageCount = extracted.pageCount;
      previewUrl = extracted.previewUrl;
    } else if (isDocx) {
      text = await extractDocxText(file);
    } else if (isSheet) {
      text = sheetsToText(await readSpreadsheet(file));
    } else {
      text = await extractPlainText(file);
    }
  } catch (err) {
    return {
      ok: false,
      error: `Could not read ${file.name}: ${
        err instanceof Error ? err.message : 'unknown error'
      }`,
    };
  }

  text = text.replace(/\s+\n/g, '\n').trim();

  if (!text) {
    return {
      ok: false,
      error: `${file.name} appears to contain no extractable text. (Scanned PDFs need OCR — not in scope yet.)`,
    };
  }

  const truncated = text.length > MAX_PER_DOC_CHARS;
  if (truncated) {
    text = text.slice(0, MAX_PER_DOC_CHARS) + '\n\n[…truncated for context window]';
  }

  const localRelativePath = resolveRelativePath(file, meta, destinationFolder);

  // Replace existing docs at the same path (folder re-upload) or local sync key.
  let replacedChars = 0;
  if (meta?.localFileKey) {
    const prev = store.filter((d) => d.localFileKey === meta.localFileKey);
    replacedChars += prev.reduce((s, d) => s + d.charCount, 0);
    store = store.filter((d) => d.localFileKey !== meta.localFileKey);
  } else if (localRelativePath) {
    const prev = store.filter((d) => d.localRelativePath === localRelativePath);
    replacedChars += prev.reduce((s, d) => s + d.charCount, 0);
    store = store.filter((d) => d.localRelativePath !== localRelativePath);
  }

  const newTotal = totalUploadedChars() - replacedChars + text.length;
  if (newTotal > MAX_TOTAL_UPLOADED_CHARS) {
    return {
      ok: false,
      error: `Adding ${file.name} would exceed the library corpus limit (~${Math.round(MAX_TOTAL_UPLOADED_CHARS / 1000)}k chars). Remove a document first.`,
    };
  }

  const doc: UploadedDoc = {
    id: uid(),
    filename: file.name,
    bytes: file.size,
    uploadedAt: new Date().toISOString(),
    text,
    pageCount,
    charCount: text.length,
    previewUrl,
    source: meta?.source ?? 'upload',
    localFileKey: meta?.localFileKey,
    localRelativePath,
  };

  store = [...store, doc];
  notify();
  return { ok: true, doc };
}

/**
 * Ingest many files (e.g. a whole folder). Skips unsupported types quietly when
 * `skipUnsupported` is true so folder uploads don't fail on .DS_Store etc.
 * Single files without their own nested path land in `destinationFolder`.
 */
export async function ingestFiles(
  files: File[],
  options?: {
    skipUnsupported?: boolean;
    /** Current library folder — single files are placed here. */
    destinationFolder?: string;
    onProgress?: (done: number, total: number, filename: string) => void;
  }
): Promise<{ docs: UploadedDoc[]; errors: string[] }> {
  const docs: UploadedDoc[] = [];
  const errors: string[] = [];
  const list = Array.from(files);
  let done = 0;
  for (const file of list) {
    options?.onProgress?.(done, list.length, file.name);
    const r = await ingestFile(file, undefined, options?.destinationFolder);
    done += 1;
    options?.onProgress?.(done, list.length, file.name);
    if (r.ok && r.doc) {
      docs.push(r.doc);
      continue;
    }
    if (
      options?.skipUnsupported &&
      r.error?.startsWith('Unsupported file type:')
    ) {
      continue;
    }
    if (r.error) errors.push(r.error);
  }
  return { docs, errors };
}

/**
 * Persist an ingested doc to the shared Supabase library when cloud is configured.
 * Local browser storage is always updated via the store; this publishes for the whole team.
 */
export async function persistDocToCloud(
  doc: UploadedDoc,
  uploaderEmail: string
): Promise<{ ok: boolean; error?: string }> {
  const { supabaseConfigured } = await import('./supabase');
  if (!supabaseConfigured()) return { ok: false, error: 'Supabase not configured' };
  const { saveDocumentToLibrary } = await import('./db/library');
  const result = await saveDocumentToLibrary(doc, uploaderEmail);
  if (result.ok) markDocShared(doc.id);
  return result;
}
