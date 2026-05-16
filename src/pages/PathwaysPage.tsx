import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { pathways } from '../data/pathways';

const pathwayDetails: Record<string, { full: string }> = {
  'humanity-with-nature': {
    full:
      'Engaging in everyday activities that have a net positive effect on nature — using frontier technologies and indigenous knowledge to enrich, rather than deplete, our environment.',
  },
  'lifelong-learning': {
    full:
      'Education that embraces collective responsibility — with indigenous leaders, art, film, community events and digital platforms complementing a journey of stewardship.',
  },
  'data-frontier-tech': {
    full:
      'Big data, AI, digital twinning and Earth observation — governed ethically in the collective interests of people and planet to safeguard the global commons.',
  },
  'water-resources': {
    full:
      'Equitable access to the water, air and land that sustain our lives. Participatory management backed by fair access to geospatial, AI and big data technologies.',
  },
  transboundary: {
    full:
      'Collective conservation, restoration and regeneration of ecosystems spanning political borders — protected through equitable use of frontier technologies and binding agreements.',
  },
  'health-wellbeing': {
    full:
      'Neighbourhoods that merge with the natural world — circular materials, biophilic design, a one-health approach, and real-time data systems for human and ecological health.',
  },
  'regenerative-food': {
    full:
      'Permaculture principles, water retention, nutrient renewal, biodiversity restoration and frontier technologies — producing nutritious food accessible and affordable to all.',
  },
  'rebuilt-finance': {
    full:
      'Innovative financial mechanisms that channel funding to organizations committed to a sustainable, resilient world — linking wealth directly to the welfare of people and planet.',
  },
};

export default function PathwaysPage() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({
    threshold: 0.05,
  });

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#FAFAF7',
        paddingTop: 'clamp(140px, 16vh, 200px)',
        paddingBottom: 'clamp(80px, 12vh, 120px)',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
        {/* Section header */}
        <header
          className={`reveal ${isVisible ? 'revealed' : ''}`}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 64,
            alignItems: 'start',
            marginBottom: 64,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#97B73B',
                marginBottom: 24,
              }}
            >
              Pathway objectives — Eight routes
            </p>
            <h1
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(40px, 5.4vw, 76px)',
                lineHeight: 1.04,
                letterSpacing: '-0.022em',
                color: '#0A1628',
                fontWeight: 300,
                margin: 0,
              }}
            >
              Eight routes toward
              <br />
              <em style={{ fontStyle: 'italic', color: '#333184' }}>
                a desirable world.
              </em>
            </h1>
          </div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 17,
              lineHeight: 1.6,
              color: '#6B7280',
              maxWidth: 480,
              marginTop: 12,
            }}
          >
            Using foresight methodologies, Resilience Frontiers developed eight
            cross-cutting pathways of transformative change. Together, they
            describe the conditions for an irreversible shift toward permanent
            resilience.
          </p>
        </header>

        {/* 4 × 2 grid of pathway cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            backgroundColor: '#E5E2D9',
            borderTop: '1px solid #E5E2D9',
            borderBottom: '1px solid #E5E2D9',
          }}
          className="pathways-grid"
        >
          {pathways.map((p, i) => {
            const detail = pathwayDetails[p.id];
            return (
              <article
                key={p.id}
                className={`reveal ${isVisible ? 'revealed' : ''}`}
                style={{
                  transitionDelay: `${Math.min(i, 7) * 50}ms`,
                  backgroundColor: '#FAFAF7',
                  padding: '36px 28px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  minHeight: 360,
                }}
              >
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#9A9690',
                  }}
                >
                  {p.number}
                </span>
                <h2
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 22,
                    lineHeight: 1.2,
                    color: '#0A1628',
                    fontWeight: 400,
                    letterSpacing: '-0.005em',
                    margin: '4px 0 0',
                  }}
                >
                  {p.title}
                </h2>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#9A9690',
                    margin: 0,
                  }}
                >
                  {p.subtitle}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#6B7280',
                    margin: '8px 0 0',
                    flex: 1,
                  }}
                >
                  {detail?.full ?? p.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* CTA — Watch the storylines film */}
        <div
          style={{
            marginTop: 72,
            padding: 40,
            border: '1px solid #E5E2D9',
            backgroundColor: '#0A1628',
            color: '#FAFAF7',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 32,
          }}
          className="pathways-cta"
        >
          <div>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#97B73B',
                marginBottom: 12,
              }}
            >
              ▶ Watch the pathways film
            </p>
            <h3
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(22px, 2vw, 30px)',
                lineHeight: 1.2,
                fontWeight: 300,
                margin: 0,
              }}
            >
              The pathway storylines, animated.
            </h3>
          </div>
          <Link
            to="/pathway-storylines"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#0A1628',
              backgroundColor: '#FAFAF7',
              padding: '14px 24px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            See storylines →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .pathways-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .pathways-grid {
            grid-template-columns: 1fr !important;
          }
          .pathways-cta {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
