import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { events } from '../data/content';
import { MapPin, Calendar } from 'lucide-react';

export default function EventsSection() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const featured = events.find((e) => e.featured);
  const archive = events.filter((e) => !e.featured);

  return (
    <section
      ref={ref}
      id="events"
      style={{
        backgroundColor: '#0A1628',
        padding: '120px 0',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
        <p
          className={`reveal ${isVisible ? 'revealed' : ''}`}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#97B73B',
            marginBottom: 16,
          }}
        >
          Featured convening
        </p>

        {/* Featured */}
        {featured && (
          <a
            href={featured.href ?? '#'}
            target="_blank"
            rel="noreferrer"
            className={`reveal ${isVisible ? 'revealed' : ''}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              border: '1px solid rgba(250, 250, 247, 0.12)',
              textDecoration: 'none',
              marginBottom: 56,
              backgroundColor: '#0A1628',
              transition: 'border-color 200ms ease',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                '#97B73B')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                'rgba(250, 250, 247, 0.12)')
            }
          >
            {/* Image side */}
            <div
              style={{
                minHeight: 380,
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
                    'linear-gradient(180deg, rgba(10,22,40,0.1) 0%, rgba(10,22,40,0.65) 100%)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 24,
                  left: 24,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#FAFAF7',
                  backgroundColor: '#97B73B',
                  padding: '4px 10px',
                }}
              >
                Featured
              </span>
            </div>

            {/* Content side */}
            <div style={{ padding: '48px 40px' }}>
              <p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#5B8FB9',
                  marginBottom: 16,
                }}
              >
                {featured.type} — {featured.year}
              </p>
              <h3
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 'clamp(28px, 3.6vw, 48px)',
                  lineHeight: 1.08,
                  color: '#FAFAF7',
                  fontWeight: 300,
                  marginBottom: 20,
                  letterSpacing: '-0.015em',
                }}
              >
                {featured.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: 'rgba(250,250,247,0.65)',
                  maxWidth: 480,
                  marginBottom: 24,
                }}
              >
                {featured.description}
              </p>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    color: 'rgba(250,250,247,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Calendar size={13} /> {featured.date}
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    color: 'rgba(250,250,247,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <MapPin size={13} /> {featured.location}
                </span>
              </div>
            </div>
          </a>
        )}

        {/* Archive header */}
        <p
          className={`reveal ${isVisible ? 'revealed' : ''}`}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(250,250,247,0.45)',
            marginBottom: 20,
          }}
        >
          Event archive
        </p>

        {/* Events list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            backgroundColor: 'rgba(250, 250, 247, 0.08)',
          }}
        >
          {archive.map((event, i) => (
            <a
              key={event.id}
              href={event.href ?? `#event-${event.id}`}
              target={event.href ? '_blank' : undefined}
              rel={event.href ? 'noreferrer' : undefined}
              className={`reveal ${isVisible ? 'revealed' : ''}`}
              style={{
                transitionDelay: `${i * 80}ms`,
                display: 'grid',
                gridTemplateColumns: '200px 1fr auto',
                gap: '40px',
                alignItems: 'center',
                backgroundColor: '#0A1628',
                padding: '28px 0',
                textDecoration: 'none',
                transition: 'background-color 200ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  'rgba(250, 250, 247, 0.04)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  '#0A1628')
              }
            >
              {/* Date & type */}
              <div>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#97B73B',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {event.type}
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                    color: '#FAFAF7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Calendar size={13} style={{ opacity: 0.5 }} />
                  {event.date}
                </span>
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: '22px',
                    lineHeight: 1.2,
                    color: '#FAFAF7',
                    fontWeight: 400,
                    marginBottom: '8px',
                  }}
                >
                  {event.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    lineHeight: 1.5,
                    color: 'rgba(250, 250, 247, 0.5)',
                    maxWidth: 720,
                  }}
                >
                  {event.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    color: 'rgba(250, 250, 247, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <MapPin size={12} />
                  {event.location}
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    color: '#5B8FB9',
                  }}
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
