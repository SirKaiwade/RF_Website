import { useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Upload,
  Trash2,
  Plus,
  FileText,
  FileSpreadsheet,
  FileType,
  Library,
} from 'lucide-react';
import {
  ingestFile,
  persistDocToCloud,
  removeUploadedDoc,
  useUploadedDocs,
  type UploadedDoc,
} from '../lib/uploads';
import { formatBytes, formatRelative, classNames } from '../lib/format';
import { EmptyState, MetaSummary, PageHeader, SearchField } from './ui';
import { useAuth } from '../lib/auth';
import { supabaseConfigured } from '../lib/supabase';
import type { ShellContext } from './AppShell';

const ACCEPT =
  '.pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,text/markdown';

type DocKind = 'pdf' | 'word' | 'sheet' | 'text' | 'other';

function docKind(filename: string): DocKind {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx' || ext === 'doc') return 'word';
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'sheet';
  if (ext === 'txt' || ext === 'md' || ext === 'markdown') return 'text';
  return 'other';
}

function KindIcon({ kind }: { kind: DocKind }) {
  const cls = 'w-4 h-4';
  if (kind === 'sheet') return <FileSpreadsheet className={cls} strokeWidth={1.5} />;
  if (kind === 'text') return <FileType className={cls} strokeWidth={1.5} />;
  return <FileText className={cls} strokeWidth={1.5} />;
}

function kindLabel(kind: DocKind): string {
  if (kind === 'pdf') return 'PDF';
  if (kind === 'word') return 'Word';
  if (kind === 'sheet') return 'Spreadsheet';
  if (kind === 'text') return 'Text';
  return 'Document';
}

function kindChip(kind: DocKind): string {
  if (kind === 'pdf') return 'chip-red';
  if (kind === 'word') return 'chip-blue';
  if (kind === 'sheet') return 'chip-green';
  if (kind === 'text') return 'chip-amber';
  return 'chip-gray';
}

function hasFilePayload(e: React.DragEvent): boolean {
  const types = e.dataTransfer?.types;
  if (!types) return false;
  return Array.from(types).includes('Files');
}

export default function LibraryPage() {
  const ctx = useOutletContext<ShellContext>();
  const { user } = useAuth();
  const uploadedDocs = useUploadedDocs();
  const cloud = supabaseConfigured();
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const sorted = [...uploadedDocs].sort((a, b) =>
      b.uploadedAt.localeCompare(a.uploadedAt)
    );
    if (!query.trim()) return sorted;
    const q = query.toLowerCase();
    return sorted.filter(
      (u) =>
        u.filename.toLowerCase().includes(q) || u.text.toLowerCase().includes(q)
    );
  }, [uploadedDocs, query]);

  const stats = useMemo(() => {
    const pages = uploadedDocs.reduce((sum, d) => sum + (d.pageCount ?? 0), 0);
    const bytes = uploadedDocs.reduce((sum, d) => sum + d.bytes, 0);
    return { count: uploadedDocs.length, pages, bytes };
  }, [uploadedDocs]);

  async function ingestMany(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    setErrors([]);
    const errs: string[] = [];
    for (const f of files) {
      const r = await ingestFile(f);
      if (!r.ok && r.error) {
        errs.push(r.error);
        continue;
      }
      if (r.doc && cloud && user?.email) {
        const saved = await persistDocToCloud(r.doc, user.email);
        if (!saved.ok && saved.error) {
          errs.push(`Saved locally but not to the shared library: ${saved.error}`);
        }
      }
    }
    setUploading(false);
    if (errs.length) setErrors(errs);
  }

  function resetDrag() {
    dragDepth.current = 0;
    setDragging(false);
  }

  function onDragEnter(e: React.DragEvent<HTMLElement>) {
    if (!hasFilePayload(e)) return;
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setDragging(true);
  }

  function onDragOver(e: React.DragEvent<HTMLElement>) {
    if (!hasFilePayload(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }

  function onDragLeave(e: React.DragEvent<HTMLElement>) {
    if (!hasFilePayload(e)) return;
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  async function onDrop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    resetDrag();
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length === 0) return;
    await ingestMany(files);
  }

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    await ingestMany(files);
  }

  function handleRemove(doc: UploadedDoc) {
    removeUploadedDoc(doc.id);
    if (ctx.openDocId === doc.id) ctx.closeDocument();
  }

  const isEmpty = uploadedDocs.length === 0;

  return (
    <section
      className={classNames(
        'flex-1 min-w-0 flex flex-col bg-surface relative',
        ctx.openDocId ? 'border-r border-rule' : ''
      )}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={onPickFiles}
      />

      <PageHeader
        icon={Library}
        title="Knowledge library"
        subtitle={
          isEmpty
            ? 'Upload reports, briefs, and project files · Nexus searches them in chat'
            : `${stats.count} document${stats.count === 1 ? '' : 's'} · ready for grounded answers`
        }
        search={
          !isEmpty ? (
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search library…"
              className="hidden sm:block"
            />
          ) : undefined
        }
        actions={
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            {uploading ? 'Adding…' : 'Upload files'}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
          {isEmpty ? (
            <EmptyLibrary
              onPick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ) : (
            <>
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Search library…"
                className="sm:hidden mb-4 max-w-none"
              />

              <MetaSummary
                items={[
                  {
                    label: stats.count === 1 ? 'document' : 'documents',
                    value: stats.count,
                  },
                  ...(stats.pages > 0
                    ? [{ label: stats.pages === 1 ? 'page' : 'pages', value: stats.pages }]
                    : []),
                  { label: 'total size', value: formatBytes(stats.bytes) },
                ]}
              />

              <UploadStrip
                onPick={() => fileInputRef.current?.click()}
                uploading={uploading}
                onDragOver={onDragOver}
                onDrop={onDrop}
              />

              {errors.length > 0 && (
                <div className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-900 fade-in">
                  <div className="font-semibold mb-1">Some files couldn&apos;t be added</div>
                  <ul className="space-y-0.5 list-disc pl-5">
                    {errors.map((er, i) => (
                      <li key={i}>{er}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8">
                <div className="flex items-baseline justify-between gap-3 mb-4">
                  <h2 className="text-[15px] font-semibold text-ink tracking-tight">
                    Documents
                  </h2>
                  <span className="text-[12px] text-gray-500">
                    {filtered.length === uploadedDocs.length
                      ? `${filtered.length} total`
                      : `${filtered.length} of ${uploadedDocs.length}`}
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center text-[13px] text-gray-500 py-14 border border-dashed border-rule rounded-sm">
                    No documents match &ldquo;{query}&rdquo;.
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((u, i) => (
                      <DocCard
                        key={u.id}
                        doc={u}
                        active={ctx.openDocId === u.id}
                        onOpen={() => ctx.openDocument(u.id)}
                        onRemove={() => handleRemove(u)}
                        style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                      />
                    ))}
                  </ul>
                )}
              </div>

              <p className="mt-10 text-[12px] text-gray-500 max-w-2xl leading-relaxed">
                {cloud
                  ? 'Documents are parsed in your browser and saved to the shared UNU Global Health library so the whole team can search them in chat.'
                  : 'Documents stay in this browser until Supabase is configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable the shared library.'}
              </p>
            </>
          )}
        </div>
      </div>

      {dragging && (
        <div
          className="absolute inset-0 z-40 bg-un-blue-bg/96 border-2 border-dashed border-un-blue m-3 rounded-sm flex items-center justify-center fade-in"
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragLeave={(e) => {
            // Leaving the overlay itself shouldn't abort a drop onto it.
            if (e.currentTarget === e.target) onDragLeave(e);
          }}
        >
          <div className="text-center px-6 pointer-events-none">
            <div className="w-14 h-14 rounded-sm bg-un-blue text-white flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <div className="text-[17px] font-semibold text-un-blue-dark tracking-tight">
              Drop to add to your library
            </div>
            <div className="text-[13px] text-un-blue mt-1">
              PDF, Word, Excel, .txt, .md
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function EmptyLibrary({
  onPick,
  onDragOver,
  onDrop,
}: {
  onPick: () => void;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className="fade-in"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <EmptyState
        icon={Library}
        title="Build your knowledge base"
        description="Upload institutional reports, briefs, project files, and notes. Nexus will search them in chat and cite every source."
        action={
          <button type="button" onClick={onPick} className="btn btn-primary">
            <Upload className="w-4 h-4" />
            Upload your first files
          </button>
        }
      >
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
          {[
            { label: 'PDF & Word', hint: 'Reports and briefs' },
            { label: 'Spreadsheets', hint: 'Matrices and lists' },
            { label: 'Plain text', hint: '.txt and Markdown' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-sm border border-rule bg-surface/80 px-3.5 py-3"
            >
              <div className="text-[12px] font-semibold text-ink">{item.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{item.hint}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-gray-500">
          Or drag files anywhere onto this page.
        </p>
      </EmptyState>
    </div>
  );
}

function UploadStrip({
  onPick,
  uploading,
  onDragOver,
  onDrop,
}: {
  onPick: () => void;
  uploading: boolean;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={uploading}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="w-full group flex items-center gap-4 rounded-sm border border-dashed border-rule-strong bg-surface-subtle hover:border-un-blue hover:bg-un-blue-bg/35 transition-colors px-4 py-3.5 text-left disabled:opacity-60"
    >
      <div className="w-10 h-10 rounded-sm bg-un-blue-bg text-un-blue flex items-center justify-center shrink-0 border border-un-blue-soft group-hover:bg-un-blue group-hover:text-white group-hover:border-un-blue transition-colors">
        <Upload className="w-[18px] h-[18px]" strokeWidth={1.6} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-ink">
          {uploading ? 'Adding documents…' : 'Drop files here or browse'}
        </div>
        <div className="text-[12px] text-gray-500 mt-0.5">
          PDF, Word, Excel, .txt, .md · up to 25 MB each
        </div>
      </div>
      <span className="hidden sm:inline-flex text-[12px] font-semibold text-un-blue group-hover:text-un-blue-dark shrink-0">
        Browse
      </span>
    </button>
  );
}

function DocCard({
  doc,
  active,
  onOpen,
  onRemove,
  style,
}: {
  doc: UploadedDoc;
  active: boolean;
  onOpen: () => void;
  onRemove: () => void;
  style?: React.CSSProperties;
}) {
  const kind = docKind(doc.filename);

  return (
    <li
      className={classNames(
        'group relative stagger-in card overflow-hidden flex flex-col',
        active ? 'border-un-blue shadow-card ring-1 ring-un-blue/20' : 'hover:border-un-blue-soft'
      )}
      style={style}
    >
      <button
        type="button"
        onClick={onOpen}
        className="text-left flex flex-col flex-1 min-h-0"
        aria-label={`Open ${doc.filename}`}
      >
        <DocPreview doc={doc} kind={kind} />
        <div className="px-3.5 py-3 border-t border-rule bg-surface">
          <div className="flex items-start gap-2">
            <h3
              className="text-[13px] font-semibold text-ink leading-snug line-clamp-2 flex-1 min-w-0"
              title={doc.filename}
            >
              {doc.filename}
            </h3>
            <span className={`chip ${kindChip(kind)} text-[9px] py-0.5 px-1.5 shrink-0`}>
              {kindLabel(kind)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500">
            <span>{formatBytes(doc.bytes)}</span>
            {doc.pageCount ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {doc.pageCount} page{doc.pageCount === 1 ? '' : 's'}
                </span>
              </>
            ) : null}
            <span aria-hidden="true">·</span>
            <span>{formatRelative(doc.uploadedAt)}</span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${doc.filename}`}
        title="Remove"
        className="absolute right-2 top-2 z-10 p-1.5 rounded-sm bg-surface/90 border border-rule text-gray-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-accent-red hover:border-accent-red/30 shadow-card transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
    </li>
  );
}

function DocPreview({ doc, kind }: { doc: UploadedDoc; kind: DocKind }) {
  if (doc.previewUrl) {
    return (
      <div className="lib-preview-frame">
        <img
          src={doc.previewUrl}
          alt=""
          className="lib-preview-img"
          draggable={false}
        />
      </div>
    );
  }

  const lines = doc.text
    .replace(/^-- page \d+ --\s*/gm, '')
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12);

  return (
    <div className="lib-preview-frame lib-preview-paper">
      <div className="lib-preview-paper-inner">
        <div className="lib-preview-paper-badge">
          <KindIcon kind={kind} />
          <span>{kindLabel(kind)}</span>
        </div>
        <div className="lib-preview-paper-body" aria-hidden="true">
          {lines.length > 0 ? (
            lines.map((line, i) => (
              <p
                key={i}
                className={classNames(
                  'lib-preview-line',
                  i === 0 && 'lib-preview-line-title'
                )}
              >
                {line}
              </p>
            ))
          ) : (
            <p className="lib-preview-line text-gray-400">Document preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
