import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { pathways } from '../data/pathways';
import { news } from '../data/content';

function AboutTeaser() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.15 });
  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#FAFAF7',
        padding: '120px 0',
        borderTop: '1px solid #E5E2D9',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '5fr 7fr',
            gap: 80,
            alignItems: 'start',
          }}
        >
          <div className={`reveal ${isVisible ? 'revealed' : ''}`}>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#97B73B',
                marginBottom: 16,
              }}
            >
              About
            </p>
            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(36px, 4.5vw, 64px)',
                lineHeight: 1.06,
                letterSpacing: '-0.018em',
                color: '#0A1628',
                fontWeight: 300,
              }}
            >
              Resilience Frontiers shifts our thinking
              <br />
              <em style={{ fontStyle: 'italic', color: '#333184' }}>
                into the future.
              </em>
            </h2>
          </div>
          <div className={`reveal reveal-delay-1 ${isVisible ? 'revealed' : ''}`}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                lineHeight: 1.55,
                color: '#0A1628',
                marginBottom: 32,
              }}
            >
              Resilience Frontiers shifts our thinking into the future, to move
              us toward a desirable world. Click below to find out more about
              our vision.
            </p>
            <Link to="/about" className="btn-primary">
              Read more →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PathwaysTeaser() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#F4F2EA',
        padding: '120px 0',
        borderTop: '1px solid #E5E2D9',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '5fr 7fr',
            gap: 80,
            alignItems: 'start',
            marginBottom: 64,
          }}
        >
          <div className={`reveal ${isVisible ? 'revealed' : ''}`}>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#97B73B',
                marginBottom: 16,
              }}
            >
              Pathways
            </p>
            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(36px, 4.5vw, 64px)',
                lineHeight: 1.06,
                letterSpacing: '-0.018em',
                color: '#0A1628',
                fontWeight: 300,
              }}
            >
              Eight pathways toward
              <br />
              <em style={{ fontStyle: 'italic', color: '#333184' }}>
                a flourishing world.
              </em>
            </h2>
          </div>
          <div className={`reveal reveal-delay-1 ${isVisible ? 'revealed' : ''}`}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 18,
                lineHeight: 1.6,
                color: '#0A1628',
                marginBottom: 16,
              }}
            >
              When we look at the future through a lens of what is possible, we
              see a flourishing world appear where people and nature can truly
              thrive.
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 17,
                lineHeight: 1.6,
                color: '#6B7280',
                marginBottom: 32,
              }}
            >
              It is a future toward which the eight pathways of change created
              by Resilience Frontiers are designed to take us.
            </p>
            <Link to="/pathways" className="btn-primary">
              Eight pathways →
            </Link>
          </div>
        </div>

        {/* Pathway cards row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            backgroundColor: '#E5E2D9',
            border: '1px solid #E5E2D9',
          }}
        >
          {pathways.slice(0, 4).map((p) => (
            <Link
              key={p.id}
              to="/pathways"
              style={{
                backgroundColor: '#FAFAF7',
                padding: 28,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                minHeight: 200,
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
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: p.color,
                }}
              >
                {p.number}
              </span>
              <h3
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 18,
                  lineHeight: 1.25,
                  color: '#0A1628',
                  fontWeight: 400,
                }}
              >
                {p.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightsRow() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const items = news.slice(0, 6);
  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#FAFAF7',
        padding: '120px 0',
        borderTop: '1px solid #E5E2D9',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 48,
            flexWrap: 'wrap',
            gap: 32,
          }}
        >
          <div className={`reveal ${isVisible ? 'revealed' : ''}`}>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#97B73B',
                marginBottom: 16,
              }}
            >
              Highlights
            </p>
            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(36px, 4.2vw, 56px)',
                lineHeight: 1.06,
                letterSpacing: '-0.018em',
                color: '#0A1628',
                fontWeight: 300,
              }}
            >
              From the
              <em style={{ fontStyle: 'italic', color: '#333184' }}>
                {' '}programme.
              </em>
            </h2>
          </div>
          <Link to="/news" className="btn-secondary">
            All news
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            backgroundColor: '#E5E2D9',
            border: '1px solid #E5E2D9',
          }}
        >
          {items.map((n) => (
            <a
              key={n.id}
              href={n.href}
              target="_blank"
              rel="noreferrer"
              className={`reveal ${isVisible ? 'revealed' : ''}`}
              style={{
                backgroundColor: '#FAFAF7',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 360,
                transition: 'background-color 200ms ease',
              }}
            >
              <div
                style={{
                  aspectRatio: '4/3',
                  backgroundImage: `url(${n.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#1E3A8A',
                }}
              />
              <div
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#6B7280',
                  }}
                >
                  · {n.category} — {n.day} {n.month} {n.year}
                </span>
                <h3
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 20,
                    lineHeight: 1.25,
                    color: '#0A1628',
                    fontWeight: 400,
                    flex: 1,
                  }}
                >
                  {n.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <PathwaysTeaser />
      <HighlightsRow />
    </>
  );
}
