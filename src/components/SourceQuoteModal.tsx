import { useEffect } from 'react';
import { Loader2, X, Eye, MapPin, AlertTriangle } from 'lucide-react';

export type QuoteModalState =
  | { open: false }
  | {
      open: true;
      citationNumber: number;
      status: 'loading' | 'ready' | 'error';
      title?: string;
      subtitle?: string;
      excerpt?: string;
      documentId?: string;
      error?: string;
    };

interface Props {
  state: QuoteModalState;
  onClose: () => void;
  onOpenDocument: (documentId: string, excerpt?: string) => void;
}

export default function SourceQuoteModal({ state, onClose, onOpenDocument }: Props) {
  useEffect(() => {
    if (!state.open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.open, onClose]);

  if (!state.open) return null;

  return (
    <div
      className="cite-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="cite-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cite-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cite-modal-header">
          <div className="min-w-0 flex-1">
            <p className="cite-modal-kicker">Source [{state.citationNumber}]</p>
            <h2 id="cite-modal-title" className="cite-modal-title truncate">
              {state.status === 'loading'
                ? 'Finding supporting quote…'
                : state.status === 'error'
                  ? 'Could not resolve quote'
                  : state.title ?? 'Source'}
            </h2>
            {state.subtitle && state.status === 'ready' && (
              <p className="cite-modal-sub truncate">{state.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cite-modal-close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </header>

        <div className="cite-modal-body">
          {state.status === 'loading' && (
            <div className="cite-modal-loading">
              <Loader2 className="w-5 h-5 text-un-blue animate-spin" />
              <p>Nexus is pulling a verbatim quote from your sources…</p>
            </div>
          )}

          {state.status === 'error' && (
            <div className="cite-modal-error">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{state.error ?? 'Something went wrong resolving this citation.'}</p>
            </div>
          )}

          {state.status === 'ready' && state.excerpt && (
            <blockquote className="cite-modal-quote">
              “{state.excerpt.replace(/^[“”"'\s]+|[“”"'\s]+$/g, '').trim()}”
            </blockquote>
          )}
        </div>

        {state.status === 'ready' && state.documentId && (
          <footer className="cite-modal-footer">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                onOpenDocument(state.documentId!, state.excerpt);
                onClose();
              }}
            >
              <MapPin className="w-3.5 h-3.5" />
              Find in document
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm text-gray-600"
              onClick={() => {
                onOpenDocument(state.documentId!);
                onClose();
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              Open
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

/** Tiny helper so callers can build loading state without importing the union. */
export function quoteModalLoading(citationNumber: number): QuoteModalState {
  return { open: true, citationNumber, status: 'loading' };
}

export function quoteModalClosed(): QuoteModalState {
  return { open: false };
}
