import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { getDocument } from '../data/documents';
import { getUploadedDocs } from '../lib/uploads';

export interface InlineSource {
  documentId: string;
  excerpt: string;
}

interface Props {
  content: string;
  sources: InlineSource[];
  /** Inline [n] chips — parent opens the document viewer and may expand sources. */
  onCitationClick: (index: number) => void;
}

const CITE_PREFIX = '#nexus-cite-';

/** Turn [1] citation markers into interceptable pseudo-links (not real markdown links). */
function preprocessCitations(text: string): string {
  return text.replace(/\[(\d+)\](?!\()/g, `[$1](${CITE_PREFIX}$1)`);
}

function docTitle(documentId: string): string {
  const seed = getDocument(documentId);
  if (seed) return seed.title;
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
        const src = sources[n - 1];
        if (!src) return <span>{children}</span>;
        const title = docTitle(src.documentId);
        return (
          <button
            type="button"
            onClick={() => onCitationClick(n - 1)}
            title={`Source ${n}: ${title} — find in document`}
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
