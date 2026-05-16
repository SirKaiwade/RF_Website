import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { news } from '../data/content';

export default function NewsHighlights() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const lead = news.find((n) => n.lead) ?? news[0];
  const dispatches = news.filter((n) => n.id !== lead.id).slice(0, 6);

  return (
    <section
      ref={ref}
      id="news"
      style={{
        backgroundColor: '#FAFAF7',
        padding: '120px 0',
        borderTop: '1px solid #E5E2D9',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
        <div
          className={`reveal ${isVisible ? 'revealed' : ''}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#97B73B',
            }}
          >
            Lead story · Latest dispatches
          </p>
          <a
            href="https://resiliencefrontiers.org/news/"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            View archive on resiliencefrontiers.org →
          </a>
        </div>

        {/* Lead + Dispatches grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '5fr 7fr',
            gap: '1px',
            backgroundColor: '#E5E2D9',
            border: '1px solid #E5E2D9',
          }}
        >
          {/* Lead story */}
          <a
            href={lead.href}
            target="_blank"
            rel="noreferrer"
            className={`reveal ${isVisible ? 'revealed' : ''}`}
            style={{
              backgroundColor: '#FAFAF7',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 540,
              padding: 0,
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '4/3',
                backgroundImage: `url(${lead.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#1E3A8A',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#FAFAF7',
                  backgroundColor: '#97B73B',
                  padding: '4px 10px',
                }}
              >
                Lead story
              </span>
            </div>
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#6B7280',
                  marginBottom: 12,
                }}
              >
                {lead.day} {lead.month} {lead.year} · {lead.category}
              </span>
              <h3
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 30,
                  lineHeight: 1.16,
                  color: '#0A1628',
                  fontWeight: 400,
                  marginBottom: 16,
                  letterSpacing: '-0.01em',
                }}
              >
                {lead.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: '#6B7280',
                  marginBottom: 24,
                  flex: 1,
                }}
              >
                A major cultural milestone — positioned as the opening feature
                with summary and emphasis ahead of the dispatches archive.
              </p>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#97B73B',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Read feature <span aria-hidden="true">→</span>
              </span>
            </div>
          </a>

          {/* Dispatches grid */}
          <div
            style={{
              backgroundColor: '#FAFAF7',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
            }}
          >
            {dispatches.map((n, i) => (
              <a
                key={n.id}
                href={n.href}
                target="_blank"
                rel="noreferrer"
                className={`reveal ${isVisible ? 'revealed' : ''}`}
                style={{
                  transitionDelay: `${i * 60}ms`,
                  textDecoration: 'none',
                  backgroundColor: '#FAFAF7',
                  padding: 28,
                  borderRight: i % 2 === 0 ? '1px solid #E5E2D9' : 'none',
                  borderBottom: i < dispatches.length - 2 ? '1px solid #E5E2D9' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 230,
                  transition: 'background-color 200ms ease',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    '#F1EFE6')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    '#FAFAF7')
                }
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                  <span
                    style={{
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontSize: 28,
                      color: '#0A1628',
                      fontWeight: 300,
                      lineHeight: 1,
                    }}
                  >
                    {n.day}
                  </span>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#6B7280',
                    }}
                  >
                    {n.month} {n.year}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#97B73B',
                  }}
                >
                  · {n.category}
                </span>
                <h4
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 18,
                    lineHeight: 1.25,
                    color: '#0A1628',
                    fontWeight: 400,
                    flex: 1,
                  }}
                >
                  {n.title}
                </h4>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#6B7280',
                    marginTop: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  Read story <span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Coverage / archive line */}
        <div
          className={`reveal ${isVisible ? 'revealed' : ''}`}
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            paddingTop: 32,
            borderTop: '1px solid #E5E2D9',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#6B7280',
                marginBottom: 12,
              }}
            >
              Independent coverage
            </p>
            <h3
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 22,
                color: '#0A1628',
                fontWeight: 400,
                marginBottom: 8,
              }}
            >
              Earth Negotiations Bulletin
            </h3>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                color: '#6B7280',
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              Independent coverage that expands the archive beyond internal
              posts — including reporting from COP 27 and COP 26.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a
                href="https://enb.iisd.org/"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#333184',
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                }}
              >
                COP 27 →
              </a>
              <a
                href="https://enb.iisd.org/"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#333184',
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                }}
              >
                COP 26 →
              </a>
            </div>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#6B7280',
                marginBottom: 12,
              }}
            >
              Stay connected
            </p>
            <h3
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 22,
                color: '#0A1628',
                fontWeight: 400,
                marginBottom: 8,
              }}
            >
              Newsletter & press
            </h3>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                color: '#6B7280',
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              Subscribe for updates, releases and programme news. For press
              enquiries, partnerships and general questions:
            </p>
            <a
              href="mailto:RF@unfccc.int"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                color: '#0A1628',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
              }}
            >
              RF@unfccc.int
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
