import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { insights } from '../data/content';

const editions = [
  {
    number: '02',
    label: 'Second edition',
    date: 'November 2025',
    intro:
      'Welcome to the second edition of our interactive channel of insights, LEAP — six pieces on becoming indigenous, nature-positive economies, art for transformative change, and the future already in the making.',
    pieces: [
      'A Word of Introduction',
      'Becoming Indigenous: A Return to the Roots is the Way Forward',
      'Nature-Positive Economy: The Idea Whose Time Has Come',
      'The River That Dreamed in Code',
      'Art for Transformative Change',
      'Protecting Nature’s Rights',
    ],
  },
  {
    number: '01',
    label: 'First edition',
    date: 'July 2025',
    intro:
      'Welcome to the first edition of our interactive channel of insights, LEAP — essays, provocations and editorial reflections curated as a publication, not a feed.',
    pieces: [
      'A Word of Introduction',
      'The Future is Already in the Making',
      'New collaborative film festival launched at Sundance',
      'Designing the Future, One Focused Transformation at a Time',
    ],
  },
];

export default function InsightsSection() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="insights"
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
            LEAP / editorial issues
          </p>
          <a
            href="https://resiliencefrontiers.org/leap/"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            Read on resiliencefrontiers.org →
          </a>
        </div>

        {/* Editions row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: 56,
          }}
        >
          {editions.map((ed, i) => (
            <a
              key={ed.number}
              href="https://resiliencefrontiers.org/leap/"
              target="_blank"
              rel="noreferrer"
              className={`reveal ${isVisible ? 'revealed' : ''}`}
              style={{
                transitionDelay: `${i * 100}ms`,
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                border: '1px solid #E5E2D9',
                padding: 40,
                backgroundColor: i === 0 ? '#0A1628' : '#FAFAF7',
                color: i === 0 ? '#FAFAF7' : '#0A1628',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 200ms ease, transform 200ms ease',
                minHeight: 360,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  '#97B73B';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  '#E5E2D9';
              }}
            >
              {/* Big edition number */}
              <span
                style={{
                  position: 'absolute',
                  right: 24,
                  top: 16,
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 220,
                  lineHeight: 1,
                  fontWeight: 300,
                  color: i === 0 ? 'rgba(151,183,59,0.3)' : 'rgba(51,49,132,0.08)',
                  letterSpacing: '-0.04em',
                  pointerEvents: 'none',
                }}
              >
                {ed.number}
              </span>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}
              >
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: i === 0 ? 'rgba(250,250,247,0.5)' : '#6B7280',
                  }}
                >
                  {ed.label} / {ed.date}
                </p>
                <h3
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 28,
                    lineHeight: 1.18,
                    fontWeight: 400,
                    maxWidth: 380,
                  }}
                >
                  {ed.intro}
                </h3>
              </div>

              <div
                style={{
                  marginTop: 32,
                  borderTop: i === 0
                    ? '1px solid rgba(250,250,247,0.12)'
                    : '1px solid #E5E2D9',
                  paddingTop: 16,
                }}
              >
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: i === 0 ? 'rgba(250,250,247,0.5)' : '#6B7280',
                    marginBottom: 12,
                  }}
                >
                  {ed.pieces.length} pieces in this issue
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {ed.pieces.slice(0, 4).map((p, idx) => (
                    <li
                      key={p}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: i === 0 ? 'rgba(250,250,247,0.65)' : '#6B7280',
                        display: 'flex',
                        gap: 10,
                      }}
                    >
                      <span style={{ color: '#97B73B', fontWeight: 600 }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {p}
                    </li>
                  ))}
                  {ed.pieces.length > 4 && (
                    <li
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: '#97B73B',
                        marginTop: 8,
                      }}
                    >
                      + {ed.pieces.length - 4} more →
                    </li>
                  )}
                </ul>
              </div>
            </a>
          ))}
        </div>

        {/* In this edition — featured pieces */}
        <div
          className={`reveal ${isVisible ? 'revealed' : ''}`}
          style={{ marginBottom: 24 }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginBottom: 16,
            }}
          >
            In this edition
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            backgroundColor: '#E5E2D9',
          }}
        >
          {insights.map((insight, i) => (
            <a
              key={insight.id}
              href={insight.href}
              target="_blank"
              rel="noreferrer"
              className={`reveal ${isVisible ? 'revealed' : ''}`}
              style={{
                transitionDelay: `${i * 100 + 100}ms`,
                backgroundColor: '#FAFAF7',
                padding: '32px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderBottom: '2px solid transparent',
                transition: 'border-color 200ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                  '#97B73B')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                  'transparent')
              }
            >
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#97B73B',
                  }}
                >
                  {insight.category}
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: '#6B7280',
                  }}
                >
                  {insight.dateFormatted}
                </span>
                {insight.pathway && (
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      color: '#D97757',
                    }}
                  >
                    {insight.pathway}
                  </span>
                )}
              </div>
              <h3
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: '22px',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  color: '#0A1628',
                  fontWeight: 400,
                }}
              >
                {insight.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: '#6B7280',
                  flex: 1,
                }}
              >
                {insight.excerpt}
              </p>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#6B7280',
                }}
              >
                {insight.readTime}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
