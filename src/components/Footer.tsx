import { Link } from 'react-router-dom';

export default function Footer() {
  const sitemapColumns = [
    {
      heading: 'About',
      links: [
        { label: 'Vision', to: '/about' },
        { label: 'Inspirations', to: '/inspirations' },
        { label: 'Invested Actors', to: '/invested-actors' },
        { label: 'Timeline', to: '/timeline' },
      ],
    },
    {
      heading: 'Pathways',
      links: [
        { label: 'Pathway objectives', to: '/pathways' },
        { label: 'Pathway storylines', to: '/pathway-storylines' },
      ],
    },
    {
      heading: 'Programme',
      links: [
        { label: 'Events', to: '/events' },
        { label: 'News', to: '/news' },
        { label: 'Insights — LEAP', to: '/insights' },
        { label: 'Contact', to: '/contact' },
      ],
    },
  ];

  return (
    <footer
      style={{
        backgroundColor: '#0A1628',
        borderTop: '1px solid rgba(250, 250, 247, 0.08)',
        padding: '80px 0 0',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
        {/* Signature line */}
        <div
          style={{
            paddingBottom: 48,
            borderBottom: '1px solid rgba(250,250,247,0.08)',
            marginBottom: 56,
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#97B73B',
              marginBottom: 16,
            }}
          >
            Stay in touch with us
          </p>
          <h2
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(24px, 2.6vw, 40px)',
              lineHeight: 1.1,
              color: '#FAFAF7',
              fontWeight: 300,
              letterSpacing: '-0.012em',
              maxWidth: 1200,
              margin: 0,
            }}
          >
            where<span style={{ color: '#97B73B' }}>.</span> the
            <span style={{ color: '#97B73B' }}>.</span> future
            <span style={{ color: '#97B73B' }}>.</span> is
            <span style={{ color: '#97B73B' }}>.</span>{' '}
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>Now.</em>
          </h2>
        </div>

        {/* Main footer grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '4fr 5fr 3fr',
            gap: '80px',
            paddingBottom: '64px',
          }}
        >
          {/* Left: wordmark + mission */}
          <div>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  padding: 8,
                  backgroundColor: '#FAFAF7',
                  display: 'inline-flex',
                }}
              >
                <img
                  src="/rf/logo.svg"
                  alt="Resilience Frontiers"
                  style={{ height: 28, width: 'auto', display: 'block' }}
                />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: '20px',
                    fontWeight: 300,
                    color: '#FAFAF7',
                    letterSpacing: '-0.01em',
                    display: 'block',
                  }}
                >
                  Resilience Frontiers
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(250, 250, 247, 0.45)',
                    marginTop: 4,
                    display: 'block',
                  }}
                >
                  UNFCCC Initiative
                </span>
              </div>
            </Link>
            <p
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 17,
                lineHeight: 1.55,
                color: 'rgba(250, 250, 247, 0.6)',
                maxWidth: 360,
              }}
            >
              “The starting point is to adjust our own mindset toward a
              desirable future world and see how we get there.”
            </p>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(250,250,247,0.4)',
                marginTop: 12,
              }}
            >
              — Youssef Nassef, UNFCCC
            </p>
          </div>

          {/* Middle: sitemap */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
            }}
          >
            {sitemapColumns.map((col) => (
              <div key={col.heading}>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#97B73B',
                    marginBottom: '16px',
                  }}
                >
                  {col.heading}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {col.links.map((link) => (
                    <li key={link.label} style={{ marginBottom: '10px' }}>
                      <Link
                        to={link.to}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '15px',
                          color: 'rgba(250, 250, 247, 0.6)',
                          textDecoration: 'none',
                          transition: 'color 200ms ease',
                        }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLAnchorElement).style.color =
                            '#FAFAF7')
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLAnchorElement).style.color =
                            'rgba(250, 250, 247, 0.6)')
                        }
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right: email signup */}
          <div>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#97B73B',
                marginBottom: '16px',
              }}
            >
              Stay informed
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ marginBottom: '24px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    color: '#FAFAF7',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(250, 250, 247, 0.2)',
                    outline: 'none',
                    padding: '10px 0',
                    marginBottom: '12px',
                    width: '100%',
                  }}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderBottomColor =
                      '#97B73B')
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderBottomColor =
                      'rgba(250, 250, 247, 0.2)')
                  }
                />
                <button
                  type="submit"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    backgroundColor: 'transparent',
                    color: 'rgba(250, 250, 247, 0.6)',
                    border: '1px solid rgba(250, 250, 247, 0.2)',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    transition: 'border-color 200ms ease, color 200ms ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.borderColor = '#97B73B';
                    btn.style.color = '#FAFAF7';
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.borderColor = 'rgba(250, 250, 247, 0.2)';
                    btn.style.color = 'rgba(250, 250, 247, 0.6)';
                  }}
                >
                  Subscribe →
                </button>
              </div>
            </form>
            <a
              href="mailto:RF@unfccc.int"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                letterSpacing: '0.04em',
                color: 'rgba(250, 250, 247, 0.5)',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = '#FAFAF7')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  'rgba(250, 250, 247, 0.5)')
              }
            >
              RF@unfccc.int
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(250, 250, 247, 0.08)',
            padding: '24px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              letterSpacing: '0.05em',
              color: 'rgba(250, 250, 247, 0.3)',
            }}
          >
            © 2024 Resilience Frontiers — UNFCCC Adaptation Programme.
          </p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a
              href="https://twitter.com/resiliencefron1"
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'rgba(250, 250, 247, 0.4)',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = '#97B73B')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  'rgba(250, 250, 247, 0.4)')
              }
            >
              X / Twitter
            </a>
            <a
              href="https://www.instagram.com/resiliencefrontiers/?hl=en"
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'rgba(250, 250, 247, 0.4)',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = '#97B73B')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  'rgba(250, 250, 247, 0.4)')
              }
            >
              Instagram
            </a>
            <Link
              to="/contact"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'rgba(250, 250, 247, 0.4)',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = '#97B73B')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  'rgba(250, 250, 247, 0.4)')
              }
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
