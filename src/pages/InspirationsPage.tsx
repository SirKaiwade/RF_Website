import PageHero from '../components/page/PageHero';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const stanzas = [
  {
    eyebrow: 'I.',
    body: 'Listening to the clear and honest voices of children, decision-makers should be under no illusions about their responsibilities to build a better world for those with the biggest stake in realising that future.',
  },
  {
    eyebrow: 'II.',
    body: 'Through storytelling, paradigm-shifting narratives are being woven that can help inspire all of us to live up to our responsibility as stewards of this great planet.',
  },
  {
    eyebrow: 'III.',
    body: 'And as we reconnect with nature on this journey, the bright futures we imagine for future generations will begin growing all around us.',
  },
  {
    eyebrow: 'IV.',
    body: 'Indigenous populations have never lost this connection and they will be important mentors in helping the world protect the precious ecosystems that sustain all life.',
  },
  {
    eyebrow: 'V.',
    body: 'Biodiversity needs this boost to support our shift to nature-based systems that can radically improve our health and well-being.',
  },
  {
    eyebrow: 'VI.',
    body: 'As our economies transition from extractive to regenerative processes — and toward a desirable future where all the basic needs of people are guaranteed.',
  },
  {
    eyebrow: 'VII.',
    body: 'We need to have this vision of the future. This drive to look at things in futuristic ways.',
  },
  {
    eyebrow: 'VIII.',
    body: 'As we shift toward a world where financial systems are designed to support environmental and human well-being. Where resources are shared.',
  },
  {
    eyebrow: 'IX.',
    body: 'As we embrace mindsets that allow us to live in harmony with nature. On our journey toward a future where we are not only surviving but thriving.',
  },
];

export default function InspirationsPage() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.05 });

  return (
    <>
      <PageHero
        eyebrow="Inspirations"
        title={
          <>
            stories that bend the
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              arc forward.
            </em>
          </>
        }
        lede="A reflection from inside the Resilience Frontiers initiative — voices, mentors and mindsets that point us toward a future of harmony, regeneration and shared flourishing."
        meta="Reading time — 4 min"
      />

      <section
        ref={ref}
        style={{
          backgroundColor: '#FAFAF7',
          padding: '96px 0 60px',
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            padding: '0 48px',
          }}
        >
          {stanzas.map((s, i) => (
            <div
              key={s.eyebrow}
              className={`reveal ${isVisible ? 'revealed' : ''}`}
              style={{
                transitionDelay: `${i * 60}ms`,
                paddingTop: 32,
                paddingBottom: 32,
                borderTop: i === 0 ? 'none' : '1px solid #E5E2D9',
                display: 'grid',
                gridTemplateColumns: '60px 1fr',
                gap: 24,
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: '#97B73B',
                  fontWeight: 400,
                }}
              >
                {s.eyebrow}
              </span>
              <p
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 'clamp(20px, 1.8vw, 26px)',
                  lineHeight: 1.45,
                  color: '#0A1628',
                  fontWeight: 300,
                  margin: 0,
                  fontStyle: 'normal',
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing image */}
      <section
        style={{
          width: '100%',
          height: 'clamp(300px, 42vw, 580px)',
          backgroundImage: 'url(/rf/cover-2.png)',
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
              'linear-gradient(180deg, rgba(10,22,40,0.05) 40%, rgba(10,22,40,0.65) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 48,
            bottom: 40,
            right: 48,
          }}
        >
          <p
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(22px, 2.4vw, 36px)',
              color: '#FAFAF7',
              maxWidth: 760,
              lineHeight: 1.25,
              fontWeight: 300,
            }}
          >
            Surviving is not enough — the work begins where{' '}
            <span style={{ color: '#97B73B' }}>thriving</span> becomes the
            baseline.
          </p>
        </div>
      </section>
    </>
  );
}
