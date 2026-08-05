import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { getDocument } from '../data/documents';
import { getUploadedDocs } from '../lib/uploads';
import { getEvent } from '../data/events';
import { getPublication } from '../data/publications';
import { normalizeCitationMarkers } from '../lib/citations';

export interface InlineSource {
  documentId: string;
  excerpt: string;
}

interface Props {
  content: string;
  sources: InlineSource[];
  /** Inline [n] chips — parent opens quote resolver / sources panel. */
  onCitationClick: (index: number) => void;
}

const CITE_PREFIX = '#nexus-cite-';

/** Turn [1] citation markers into interceptable pseudo-links (not real markdown links). */
function preprocessCitations(text: string): string {
  return normalizeCitationMarkers(text).replace(
    /\[(\d+)\](?!\()/g,
    `[$1](${CITE_PREFIX}$1)`
  );
}

function docTitle(documentId: string): string {
  if (!documentId) return 'Source';
  const seed = getDocument(documentId);
  if (seed) return seed.title;
  const event = getEvent(documentId);
  if (event) return event.title;
  const pub = getPublication(documentId);
  if (pub) return pub.title;
  const uploaded = getUploadedDocs().find((d) => d.id === documentId);
  return uploaded?.filename ?? 'Source';
}

function isLibraryDeepLink(href: string | undefined): boolean {
  if (!href) return false;
  try {
    if (href.startsWith('/library')) return true;
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin && url.pathname === '/library';
  } catch {
    return false;
  }
}

function libraryLinkTo(href: string): string {
  try {
    const url = new URL(href, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}

export default function AnswerMarkdown({ content, sources, onCitationClick }: Props) {
  const components: Components = {
    a: ({ href, children }) => {
      if (href?.startsWith(CITE_PREFIX)) {
        const n = parseInt(href.slice(CITE_PREFIX.length), 10);
        if (!Number.isFinite(n) || n < 1) return <span>{children}</span>;
        const src = sources[n - 1];
        const title = src?.documentId
          ? docTitle(src.documentId)
          : `Source ${n}`;
        return (
          <button
            type="button"
            onClick={() => onCitationClick(n - 1)}
            title={`Show source ${n}${src?.documentId ? `: ${title}` : ''}`}
            className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 mx-0.5 -mt-0.5 align-middle rounded-sm bg-un-blue-bg text-un-blue text-[10px] font-bold font-mono hover:bg-un-blue hover:text-white transition-colors"
          >
            {n}
          </button>
        );
      }
      if (isLibraryDeepLink(href) && href) {
        return (
          <Link
            to={libraryLinkTo(href)}
            className="text-un-blue font-medium underline underline-offset-2 decoration-un-blue/40 hover:decoration-un-blue"
          >
            {children}
          </Link>
        );
      }
      const external = href?.startsWith('http');
      return (
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
    pre: ({ children }) => <pre>{children}</pre>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {preprocessCitations(content)}
    </ReactMarkdown>
  );
}
