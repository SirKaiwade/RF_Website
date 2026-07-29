import { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Copy,
  Check,
  ArrowUpRight,
  Upload,
  Paperclip,
  X,
  Library,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Conversation, ChatMessage } from '../types/chat';
import { Avatar, NexusMark, ThinkingBar } from './ui';
import { classNames, formatBytes } from '../lib/format';
import { documents } from '../data/documents';
import { eventsStore } from '../data/events';
import { publicationsStore } from '../data/publications';
import { getPerson } from '../data/people';
import { useAuth } from '../lib/auth';
import {
  ingestFile,
  persistDocToCloud,
  removeUploadedDoc,
  useUploadedDocs,
  type UploadedDoc,
} from '../lib/uploads';
import { supabaseConfigured } from '../lib/supabase';
import Composer from './Composer';
import AnswerMarkdown from './AnswerMarkdown';
import SourcesPanel from './SourcesPanel';

interface Props {
  conversation: Conversation | null;
  onSend: (text: string) => void;
  onOpenDocument: (id: string, highlight?: string) => void;
  onToggleSave: (messageId: string) => void;
  openDocId: string | null;
}

function hasFilePayload(e: React.DragEvent): boolean {
  const types = e.dataTransfer?.types;
  if (!types) return false;
  return Array.from(types).includes('Files');
}

export default function ChatThread({
  conversation,
  onSend,
  onOpenDocument,
  onToggleSave,
  openDocId,
}: Props) {
  const { user } = useAuth();
  const messages = conversation?.messages ?? [];
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const uploadedDocs = useUploadedDocs();
  const [dragging, setDragging] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, messages[messages.length - 1]?.pending, messages[messages.length - 1]?.content]);

  const isEmpty = !conversation || messages.length === 0;

  function resetDrag() {
    dragDepth.current = 0;
    setDragging(false);
  }

  async function ingestMany(files: File[]) {
    if (files.length === 0) return;
    setDropError(null);
    const errors: string[] = [];
    const cloud = supabaseConfigured();
    for (const f of files) {
      const r = await ingestFile(f);
      if (!r.ok && r.error) {
        errors.push(r.error);
        continue;
      }
      if (r.doc && cloud && user?.email) {
        const saved = await persistDocToCloud(r.doc, user.email);
        if (!saved.ok && saved.error) errors.push(saved.error);
      }
    }
    if (errors.length) setDropError(errors[0]);
  }

  async function onDrop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    resetDrag();
    await ingestMany(Array.from(e.dataTransfer.files ?? []));
  }

  return (
    <section
      className={classNames(
        'chat-stage flex-1 min-w-0 flex flex-col relative',
        openDocId ? 'border-r border-rule' : ''
      )}
      onDragEnter={(e) => {
        if (!hasFilePayload(e)) return;
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (!hasFilePayload(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <header className="chat-topbar shrink-0">
        <div className="chat-topbar-inner">
          <NexusMark size={22} />
          <div className="min-w-0 flex-1">
            <h1 className="chat-topbar-title truncate">
              {conversation ? conversation.title : 'New chat'}
            </h1>
          </div>
          {!isEmpty && (
            <span className="chat-topbar-meta hidden sm:inline">Cited answers</span>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll">
        <div className={classNames('chat-column', isEmpty && 'chat-column-empty')}>
          {isEmpty ? (
            <EmptyChat onSend={onSend} uploadedDocs={uploadedDocs} />
          ) : (
            <div className="chat-thread">
              {messages.map((m, i) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  index={i}
                  onOpenDocument={onOpenDocument}
                  onToggleSave={onToggleSave}
                />
              ))}
              <div ref={endRef} className="h-6" />
            </div>
          )}
        </div>
      </div>

      <div className="chat-composer-dock shrink-0">
        <div className="chat-composer-fade" aria-hidden="true" />
        <div className="chat-column chat-composer-pad">
          {uploadedDocs.length > 0 && (
            <UploadedRail docs={uploadedDocs} onOpen={onOpenDocument} />
          )}
          <Composer
            onSend={onSend}
            placeholder={
              isEmpty
                ? uploadedDocs.length > 0
                  ? 'Ask about your document…'
                  : 'Ask Nexus…'
                : 'Ask a follow-up…'
            }
          />
          {dropError && (
            <div className="mt-2 text-[12px] text-accent-red fade-in">{dropError}</div>
          )}
          <p className="chat-disclaimer">
            Grounded in your sources · verify citations before briefing
          </p>
        </div>
      </div>

      {dragging && (
        <div
          className="chat-drop-overlay"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={onDrop}
        >
          <div className="chat-drop-card pointer-events-none">
            <Upload className="w-7 h-7 text-un-blue mb-3" strokeWidth={1.5} />
            <div className="text-[16px] font-semibold text-un-blue-dark tracking-tight">
              Drop to attach
            </div>
            <div className="text-[12px] text-un-blue mt-1">PDF, Word, Excel, text</div>
          </div>
        </div>
      )}
    </section>
  );
}

function UploadedRail({
  docs,
  onOpen,
}: {
  docs: UploadedDoc[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
      {docs.map((d) => (
        <div
          key={d.id}
          className="chat-attach-chip group shrink-0"
          title={`${d.filename} · ${formatBytes(d.bytes)}${d.pageCount ? ` · ${d.pageCount} pages` : ''}`}
        >
          <Paperclip className="w-3 h-3 text-un-blue shrink-0" strokeWidth={1.75} />
          <button
            type="button"
            onClick={() => onOpen(d.id)}
            className="max-w-[140px] truncate text-gray-700 hover:text-un-blue-dark"
          >
            {d.filename}
          </button>
          <button
            type="button"
            onClick={() => removeUploadedDoc(d.id)}
            aria-label={`Remove ${d.filename}`}
            className="p-0.5 rounded-sm text-gray-400 hover:text-accent-red"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function EmptyChat({
  onSend,
  uploadedDocs,
}: {
  onSend: (q: string) => void;
  uploadedDocs: UploadedDoc[];
}) {
  const hasUploads = uploadedDocs.length > 0;
  const eventCount = eventsStore.get().length;
  const pubCount = publicationsStore.get().length;
  const libCount = documents.length;
  const hasInstitutional = libCount > 0 || eventCount > 0 || pubCount > 0;

  if (!hasUploads && !hasInstitutional) {
    return (
      <div className="chat-empty chat-empty-center fade-up">
        <div className="chat-empty-orb" aria-hidden="true">
          <NexusMark size={36} />
        </div>
        <h2 className="chat-empty-title">Start with your sources</h2>
        <p className="chat-empty-lead">
          Upload reports to the library, or drop a file here. Nexus answers with citations.
        </p>
        <Link to="/library" className="btn btn-primary mt-6">
          <Library className="w-4 h-4" />
          Open knowledge library
        </Link>
        <p className="mt-5 text-[12px] text-gray-500">Or drag a PDF onto this page</p>
      </div>
    );
  }

  const starters = hasUploads
    ? [
        `Summarise ${uploadedDocs[0].filename} in 5 lines`,
        `What are the key findings in ${uploadedDocs[0].filename}?`,
        uploadedDocs.length > 1
          ? `Compare ${uploadedDocs[0].filename} to ${uploadedDocs[1].filename}`
          : `What questions does ${uploadedDocs[0].filename} leave open?`,
      ]
    : [
        'What events are coming up next?',
        'What have we published this year?',
        'Who should I talk to about gender equality?',
      ];

  const corpusBits = hasUploads
    ? [`${uploadedDocs.length} upload${uploadedDocs.length === 1 ? '' : 's'}`]
    : [
        eventCount > 0 ? `${eventCount} events` : null,
        pubCount > 0 ? `${pubCount} publications` : null,
        libCount > 0 ? `${libCount} docs` : null,
      ].filter(Boolean);

  return (
    <div className="chat-empty fade-up">
      <div className="chat-empty-orb" aria-hidden="true">
        <NexusMark size={36} />
      </div>
      <h2 className="chat-empty-title">Ask Nexus</h2>
      <p className="chat-empty-lead">
        Grounded answers from{' '}
        <span className="text-ink font-medium">{corpusBits.join(' · ')}</span>
      </p>

      <div className="chat-starters">
        {starters.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => onSend(s)}
            className="chat-starter group"
            style={{ animationDelay: `${80 + i * 60}ms` }}
          >
            <span className="flex-1 text-left">{s}</span>
            <ArrowUpRight
              className="w-3.5 h-3.5 text-gray-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              strokeWidth={1.75}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  onOpenDocument: (id: string, highlight?: string) => void;
  onToggleSave: (id: string) => void;
}

function MessageBubble({
  message,
  index,
  onOpenDocument,
  onToggleSave,
}: MessageBubbleProps) {
  const [focusedSource, setFocusedSource] = useState<number | null>(null);
  const { user } = useAuth();

  function handleCitationClick(srcIndex: number) {
    setFocusedSource(srcIndex);
    const source = message.sources?.[srcIndex];
    if (source) onOpenDocument(source.documentId, source.excerpt);
  }

  if (message.role === 'user') {
    return (
      <div
        className="chat-msg chat-msg-user fade-up"
        style={{ animationDelay: `${Math.min(index, 4) * 20}ms` }}
      >
        <div className="chat-user-bubble">{message.content}</div>
        <div
          className="chat-avatar chat-avatar-user"
          aria-hidden="true"
          title={user?.name ?? 'You'}
        >
          {user?.initials ?? 'YO'}
        </div>
      </div>
    );
  }

  return (
    <div
      className="chat-msg chat-msg-assistant fade-up"
      style={{ animationDelay: `${Math.min(index, 4) * 20}ms` }}
    >
      <div className="chat-avatar chat-avatar-nexus" aria-hidden="true">
        <NexusMark size={28} />
      </div>
      <div className="chat-assistant-body min-w-0 flex-1">
        {message.pending ? (
          <ThinkingBar label="Searching your sources…" />
        ) : (
          <>
            <div className="prose-chat chat-answer">
              <AnswerMarkdown
                content={message.content}
                sources={message.sources ?? []}
                onCitationClick={handleCitationClick}
              />
            </div>

            {message.sources && message.sources.length > 0 && (
              <SourcesPanel
                sources={message.sources}
                focusIndex={focusedSource}
                onVerifyDocument={onOpenDocument}
                onPreviewDocument={(id) => onOpenDocument(id)}
              />
            )}

            {(message.relatedPeopleIds?.length) ? (
              <div className="chat-related mt-5 space-y-4">
                {message.relatedPeopleIds && message.relatedPeopleIds.length > 0 && (
                  <div>
                    <div className="chat-section-label">People</div>
                    <div className="flex flex-wrap gap-1.5">
                      {message.relatedPeopleIds.map((id) => {
                        const p = getPerson(id);
                        if (!p) return null;
                        return (
                          <span
                            key={id}
                            className="chat-person-chip"
                            title={`${p.role}, ${p.team}`}
                          >
                            <Avatar initials={p.avatarInitials} color={p.avatarColor} size="xs" />
                            {p.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="chat-msg-footer">
              <MessageActions message={message} onToggleSave={onToggleSave} />
              {message.confidence !== undefined && (
                <span className="chat-confidence tabular-nums">
                  {Math.round(message.confidence * 100)}% confidence
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MessageActions({
  message,
  onToggleSave,
}: {
  message: ChatMessage;
  onToggleSave: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function copy() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => onToggleSave(message.id)}
        title={message.saved ? 'Unsave' : 'Save'}
        className={classNames(
          'chat-icon-btn',
          message.saved && 'chat-icon-btn-active'
        )}
      >
        <Bookmark className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={copy}
        title={copied ? 'Copied' : 'Copy'}
        className={classNames('chat-icon-btn', copied && 'text-accent-green')}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
        ) : (
          <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}
