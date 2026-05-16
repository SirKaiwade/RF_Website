import { Link } from 'react-router-dom';
import PageHero from '../components/page/PageHero';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { pathways } from '../data/pathways';

const storylines: Record<
  string,
  { current: string; aspirational: string }
> = {
  'humanity-with-nature': {
    current:
      'Humanity continues to consume nature faster than it can regenerate. Extractive habits embed themselves deeper in everyday systems.',
    aspirational:
      'Daily activities have a net-positive effect on nature. Frontier technologies and indigenous knowledge enrich our environment, securing collective wellbeing.',
  },
  'lifelong-learning': {
    current:
      'Education remains siloed and rarely centres environmental stewardship as a lifelong civic responsibility.',
    aspirational:
      'Learning systems treat us as guardians of nature — with indigenous leaders, art, film and digital platforms supporting a journey of stewardship.',
  },
  'data-frontier-tech': {
    current:
      'Frontier technologies are concentrated in a few hands, with governance lagging behind capability and unequal access widening.',
    aspirational:
      'AI, big data, digital twins and Earth observation are governed ethically in the collective interest — safeguarding the global commons.',
  },
  'water-resources': {
    current:
      'Water and natural resource access remains unequal; geospatial intelligence is rarely shared with the communities most affected.',
    aspirational:
      'Equitable access is participatory and data-backed. Geospatial, AI and big-data tools are stewarded with the people who depend on them.',
  },
  transboundary: {
    current:
      'Transboundary issues are framed through competition; ecosystems spanning borders fall through governance gaps.',
    aspirational:
      'Cooperation underpins shared stewardship. Frontier technologies and binding agreements protect cross-border ecosystems and the most vulnerable.',
  },
  'health-wellbeing': {
    current:
      'Health systems treat ecological collapse as background — adapting reactively rather than designing with nature.',
    aspirational:
      'Neighbourhoods merge with the natural world. Circular materials, biophilic design and one-health approaches let human-natural systems thrive together.',
  },
  'regenerative-food': {
    current:
      'Industrial agriculture continues to deplete soils and biodiversity; food security is fragile and inequitable.',
    aspirational:
      'Regenerative practices boost yields while restoring ecosystems. Permaculture, water retention, biodiversity and frontier tech feed everyone, well.',
  },
  'rebuilt-finance': {
    current:
      'Finance still rewards extractive value; climate-and-nature externalities are priced poorly or not at all.',
    aspirational:
      'Innovative financial mechanisms link wealth to the welfare of others and the wellbeing of the planet — funding the resilient, equitable world.',
  },
};

export default function PathwayStorylinesPage() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.05 });

  return (
    <>
      <PageHero
        eyebrow="Pathway storylines"
        title={
          <>
            current route vs.
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              aspirational future.
            </em>
          </>
        }
        lede="For each of the eight pathways of transformation, we have developed two possible storylines: the current route we remain on without change, and the aspirational vision unlocked by deeper paradigm shifts. The animations below make those futures easier to compare, discuss and act on."
        meta="Eight pathways · Two futures each"
      />

      <section
        ref={ref}
        style={{ backgroundColor: '#FAFAF7', padding: '96px 0 120px' }}
      >
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '32px',
            }}
          >
            {pathways.map((p, i) => {
              const sl = storylines[p.id];
              return (
                <article
                  key={p.id}
                  className={`reveal ${isVisible ? 'revealed' : ''}`}
                  style={{
                    transitionDelay: `${Math.min(i, 7) * 50}ms`,
                    border: '1px solid #E5E2D9',
                    backgroundColor: '#FAFAF7',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Video placeholder */}
                  <div
                    style={{
                      aspectRatio: '16/9',
                      backgroundColor: '#0A1628',
                      position: 'relative',
                      backgroundImage: `radial-gradient(circle at 30% 40%, ${p.color}38, transparent 60%), radial-gradient(circle at 70% 60%, #5B8FB938, transparent 65%)`,
                    }}
                  >
                    <svg
                      viewBox="0 0 100 100"
                      width={120}
                      height={120}
                      fill="none"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        right: 24,
                        top: 24,
                        opacity: 0.55,
                      }}
                    >
                      <path
                        d={p.markPath}
                        stroke={p.color}
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {/* Play overlay */}
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        padding: 24,
                        textAlign: 'left',
                      }}
                      aria-label={`Play storyline animation for ${p.title}`}
                    >
                      <span
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          backgroundColor: '#FAFAF7',
                          color: '#0A1628',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          marginBottom: 16,
                        }}
                      >
                        ▶
                      </span>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'rgba(250,250,247,0.6)',
                        }}
                      >
                        {p.number} — Storyline
                      </span>
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <h2
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: 22,
                        lineHeight: 1.22,
                        color: '#0A1628',
                        fontWeight: 400,
                        margin: 0,
                      }}
                    >
                      {p.title}
                    </h2>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          padding: 16,
                          backgroundColor: '#F4F2EA',
                          borderTop: '2px solid #D97757',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 10,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#D97757',
                            marginBottom: 6,
                          }}
                        >
                          Current route
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: '#6B7280',
                            margin: 0,
                          }}
                        >
                          {sl?.current}
                        </p>
                      </div>
                      <div
                        style={{
                          padding: 16,
                          backgroundColor: '#F4F2EA',
                          borderTop: '2px solid #97B73B',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 10,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#97B73B',
                            marginBottom: 6,
                          }}
                        >
                          Aspirational future
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: '#0A1628',
                            margin: 0,
                          }}
                        >
                          {sl?.aspirational}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 64,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <p
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 18,
                color: '#6B7280',
                maxWidth: 540,
              }}
            >
              The animations are designed to make those futures easier to
              compare, discuss and act on.
            </p>
            <Link to="/pathways" className="btn-secondary">
              Pathway objectives →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
