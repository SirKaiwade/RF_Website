import { Link } from 'react-router-dom';
import PageHero from '../components/page/PageHero';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function AboutPage() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            where.<span style={{ color: '#97B73B' }}> </span>the.
            <span style={{ color: '#97B73B' }}> </span>future.
            <span style={{ color: '#97B73B' }}> </span>is.{' '}
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>Now.</em>
          </>
        }
        lede="Resilience Frontiers shifts our thinking into the future, to move us toward a desirable world."
        meta="Vision — UNFCCC-led initiative"
      />

      <section
        ref={ref}
        style={{
          backgroundColor: '#FAFAF7',
          padding: '96px 0 120px',
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
            {/* Left: Vision label + quote */}
            <div>
              <p
                className={`reveal ${isVisible ? 'revealed' : ''}`}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#97B73B',
                  marginBottom: 16,
                }}
              >
                Vision
              </p>
              <h2
                className={`reveal reveal-delay-1 ${isVisible ? 'revealed' : ''}`}
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 'clamp(28px, 2.6vw, 40px)',
                  lineHeight: 1.18,
                  letterSpacing: '-0.012em',
                  color: '#0A1628',
                  fontWeight: 300,
                  marginBottom: 32,
                }}
              >
                A unique UN-catalysed initiative
                <br />
                <em style={{ fontStyle: 'italic', color: '#333184' }}>
                  for a desirable future world.
                </em>
              </h2>

              <figure
                className={`reveal reveal-delay-2 ${isVisible ? 'revealed' : ''}`}
                style={{
                  margin: 0,
                  padding: 32,
                  border: '1px solid #E5E2D9',
                  borderLeft: '3px solid #97B73B',
                  backgroundColor: '#F4F2EA',
                  marginBottom: 24,
                }}
              >
                <blockquote
                  style={{
                    margin: 0,
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 22,
                    lineHeight: 1.35,
                    color: '#0A1628',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    marginBottom: 20,
                  }}
                >
                  “The starting point is to adjust our own mindset toward a
                  desirable future world and see how we get there — and what
                  types of new systems can be catalysed to produce that future
                  world.”
                </blockquote>
                <figcaption
                  style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <span
                    style={{
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontSize: 17,
                      color: '#0A1628',
                    }}
                  >
                    Youssef Nassef
                  </span>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#6B7280',
                    }}
                  >
                    Director, Adaptation; Founder, Resilience Frontiers — UNFCCC
                  </span>
                </figcaption>
              </figure>

              <a
                href="https://resiliencefrontiers.org/wp-content/uploads/2024/03/Update-Brochure-Mar-24-spreads.pdf"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                See brochure →
              </a>
            </div>

            {/* Right: body copy */}
            <div className={`reveal reveal-delay-1 ${isVisible ? 'revealed' : ''}`}>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 22,
                  lineHeight: 1.55,
                  color: '#0A1628',
                  marginBottom: 24,
                }}
              >
                Resilience Frontiers is a unique UN-catalysed initiative which
                lets us shake off the limitations of today’s systems to think
                and act in ways that create a resilient, thriving future for
                humanity and nature.
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 19,
                  lineHeight: 1.6,
                  color: '#0A1628',
                  marginBottom: 24,
                }}
              >
                The UNFCCC-led initiative shows how frontier technologies,
                indigenous knowledge and environmental stewardship can enrich,
                rather than deplete, our future world.
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: '#6B7280',
                  marginBottom: 24,
                }}
              >
                The building blocks of Resilience Frontiers were co-created by a
                diverse team of international experts and foresight thinkers
                who, following a rigorous methodological process, developed
                eight pathways of transformative change that catalyse an
                irreversible shift toward a desirable future.
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: '#6B7280',
                  marginBottom: 32,
                }}
              >
                By inspiring a new action-oriented mindset and worldview, these
                pathways put a thriving world of resilience within reach.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16,
                }}
              >
                <Link
                  to="/inspirations"
                  className="btn-secondary"
                  style={{ textAlign: 'left' }}
                >
                  Inspirations →
                </Link>
                <Link
                  to="/invested-actors"
                  className="btn-secondary"
                  style={{ textAlign: 'left' }}
                >
                  Invested actors →
                </Link>
                <Link
                  to="/timeline"
                  className="btn-secondary"
                  style={{ textAlign: 'left' }}
                >
                  Timeline →
                </Link>
                <Link
                  to="/pathways"
                  className="btn-secondary"
                  style={{ textAlign: 'left' }}
                >
                  Pathway objectives →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial photo strip */}
      <section
        style={{
          width: '100%',
          height: 'clamp(300px, 40vw, 540px)',
          backgroundImage: 'url(/rf/cover-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10,22,40,0) 40%, rgba(10,22,40,0.7) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 48,
            bottom: 32,
            right: 48,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(22px, 2.6vw, 38px)',
              color: '#FAFAF7',
              maxWidth: 720,
              lineHeight: 1.2,
              fontWeight: 300,
            }}
          >
            A flourishing world where people and nature can truly thrive.
          </p>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(250,250,247,0.6)',
            }}
          >
            RF Field Programme
          </span>
        </div>
      </section>
    </>
  );
}
