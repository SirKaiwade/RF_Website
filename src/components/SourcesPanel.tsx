import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  FileText,
  Loader2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import type { SourceReference } from '../types';
import { getDocument } from '../data/documents';
import { getEvent } from '../data/events';
import { getPublication } from '../data/publications';
import { eventDateLabel, eventToText, publicationToText } from '../lib/corpusText';
import { getUploadedDocs } from '../lib/uploads';
import { findHighlight } from '../lib/highlight';
import { classNames } from '../lib/format';

type VerifyStatus = 'idle' | 'searching' | 'found' | 'paraphrased' | 'missing';

interface Props {
  sources: SourceReference[];
  focusIndex?: number | null;
  onVerifyDocument: (documentId: string, excerpt: string) => void;
  onPreviewDocument: (documentId: string) => void;
}

function docLabel(documentId: string): { title: string; subtitle: string } | null {
  const seed = getDocument(documentId);
  if (seed) {
    return { title: seed.title, subtitle: `${seed.type} · ${seed.team}` };
  }
  const event = getEvent(documentId);
  if (event) {
    return {
      title: event.title,
      subtitle: `Event · ${eventDateLabel(event)}`,
    };
  }
  const pub = getPublication(documentId);
  if (pub) {
    return {
      title: pub.title,
      subtitle: `Publication${pub.type ? ` · ${pub.type}` : ''}`,
    };
  }
  const uploaded = getUploadedDocs().find((d) => d.id === documentId);
  if (uploaded) {
    return { title: uploaded.filename, subtitle: 'Library upload' };
  }
  return null;
}

function docText(documentId: string): string | null {
  const uploaded = getUploadedDocs().find((d) => d.id === documentId);
  if (uploaded) return uploaded.text;
  const seed = getDocument(documentId);
  if (seed) return seed.excerpt ?? seed.summary ?? null;
  const event = getEvent(documentId);
  if (event) return eventToText(event);
  const pub = getPublication(documentId);
  if (pub) return publicationToText(pub);
  return null;
}

export default function SourcesPanel({
  sources,
  focusIndex = null,
  onVerifyDocument,
  onPreviewDocument,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<Record<number, VerifyStatus>>({});
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (focusIndex == null) return;
    setExpanded(true);
    setOpenRow(focusIndex);
    const el = rowRefs.current.get(focusIndex);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }
  }, [focusIndex]);

  if (sources.length === 0) return null;

  async function handleVerify(index: number, source: SourceReference) {
    setVerifyStatus((prev) => ({ ...prev, [index]: 'searching' }));
    setOpenRow(index);
    await new Promise((r) => setTimeout(r, 220));

    const text = docText(source.documentId);
    const match = text ? findHighlight(text, source.excerpt) : null;
    const status: VerifyStatus = match
      ? match.kind === 'paraphrase'
        ? 'paraphrased'
        : 'found'
      : 'missing';

    setVerifyStatus((prev) => ({ ...prev, [index]: status }));
    onVerifyDocument(source.documentId, source.excerpt);
  }

  return (
    <div className="chat-sources mt-5 fade-in">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="chat-sources-toggle"
        aria-expanded={expanded}
      >
        <FileText className="w-3.5 h-3.5 text-un-blue shrink-0" strokeWidth={1.75} />
        <span className="font-semibold text-ink">
          {sources.length} source{sources.length === 1 ? '' : 's'}
        </span>
        <span className="text-gray-500 hidden sm:inline">· verify before citing</span>
        <ChevronDown
          className={classNames(
            'w-3.5 h-3.5 text-gray-400 ml-auto shrink-0 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="chat-sources-list">
          {sources.map((source, i) => {
            const meta = docLabel(source.documentId);
            if (!meta) return null;
            const index = i + 1;
            const isOpen = openRow === i;
            const status = verifyStatus[i] ?? 'idle';

            return (
              <div
                key={`${source.documentId}-${i}`}
                ref={(el) => {
                  if (el) rowRefs.current.set(i, el);
                  else rowRefs.current.delete(i);
                }}
                className={classNames(
                  'chat-source-row',
                  focusIndex === i && 'chat-source-row-focus'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenRow(isOpen ? null : i)}
                  className="w-full text-left flex items-start gap-2.5 group"
                >
                  <span className="chat-cite-num">{index}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-medium text-ink truncate group-hover:text-un-blue-dark transition-colors">
                      {meta.title}
                    </span>
                    <span className="block text-[11px] text-gray-500 truncate mt-0.5">
                      {meta.subtitle}
                    </span>
                  </span>
                  <StatusBadge status={status} />
                </button>

                {isOpen && (
                  <div className="mt-2.5 ml-7 space-y-2.5 fade-in">
                    <blockquote className="chat-source-quote">
                      {source.excerpt.replace(/^[…\s]+|[…\s]+$/g, '').trim()}
                    </blockquote>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerify(i, source)}
                        disabled={status === 'searching'}
                        className="btn btn-primary btn-sm"
                      >
                        {status === 'searching' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Locating…
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5" />
                            Find in document
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onPreviewDocument(source.documentId)}
                        className="btn btn-ghost btn-sm text-gray-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Open
                      </button>
                    </div>
                    {status === 'found' && (
                      <p className="chat-verify-ok">Passage highlighted in the viewer.</p>
                    )}
                    {(status === 'paraphrased' || status === 'missing') && (
                      <p className="chat-verify-warn">
                        {status === 'paraphrased'
                          ? 'Closest related passage highlighted — review before citing.'
                          : "Couldn't find this exact passage — review the full document."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: VerifyStatus }) {
  if (status === 'searching') {
    return <Loader2 className="w-3.5 h-3.5 text-un-blue animate-spin shrink-0 mt-1" />;
  }
  if (status === 'found') {
    return <CheckCircle2 className="w-3.5 h-3.5 text-accent-green shrink-0 mt-1" />;
  }
  if (status === 'paraphrased' || status === 'missing') {
    return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-1" />;
  }
  return null;
}
