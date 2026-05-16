import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function ContactSection() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const [submitted, setSubmitted] = useState(false);

  const labelStyle = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#6B7280',
    marginBottom: 6,
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    fontSize: 15,
    color: '#0A1628',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid #E5E2D9',
    outline: 'none',
    padding: '8px 0 12px',
    transition: 'border-color 200ms ease',
  };

  return (
    <section
      ref={ref}
      id="contact"
      style={{
        backgroundColor: '#F4F2EA',
        padding: '120px 0',
        borderTop: '1px solid #E5E2D9',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '5fr 7fr',
            gap: 80,
            alignItems: 'start',
          }}
        >
          {/* Left — copy */}
          <div className={`reveal ${isVisible ? 'revealed' : ''}`}>
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
              Start a conversation
            </p>
            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(28px, 3.2vw, 44px)',
                lineHeight: 1.1,
                letterSpacing: '-0.012em',
                color: '#0A1628',
                fontWeight: 300,
                marginBottom: 24,
              }}
            >
              Tell us what you’re reaching out about,{' '}
              <em style={{ fontStyle: 'italic', color: '#333184' }}>
                and we’ll be in touch.
              </em>
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 17,
                lineHeight: 1.6,
                color: '#6B7280',
                marginBottom: 32,
                maxWidth: 440,
              }}
            >
              Share your details and tell us what you’re reaching out about —
              press enquiries, partnerships, newsletter requests and general
              questions all welcome. For direct contact:
            </p>
            <a
              href="mailto:RF@unfccc.int"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                color: '#0A1628',
                textDecoration: 'underline',
                textUnderlineOffset: 6,
                textDecorationThickness: 1,
              }}
            >
              RF@unfccc.int
            </a>
          </div>

          {/* Right — form */}
          <form
            className={`reveal reveal-delay-1 ${isVisible ? 'revealed' : ''}`}
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            style={{
              backgroundColor: '#FAFAF7',
              border: '1px solid #E5E2D9',
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
              }}
            >
              <div>
                <label htmlFor="firstName" style={labelStyle}>
                  First name
                </label>
                <input id="firstName" type="text" placeholder="First name" style={inputStyle} required />
              </div>
              <div>
                <label htmlFor="lastName" style={labelStyle}>
                  Last name
                </label>
                <input id="lastName" type="text" placeholder="Last name" style={inputStyle} required />
              </div>
            </div>

            <div>
              <label htmlFor="email" style={labelStyle}>
                Email
              </label>
              <input id="email" type="email" placeholder="name@example.com" style={inputStyle} required />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
              }}
            >
              <div>
                <label htmlFor="country" style={labelStyle}>
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  placeholder="Country / region"
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="interest" style={labelStyle}>
                  Area of interest
                </label>
                <select
                  id="interest"
                  style={{
                    ...inputStyle,
                    appearance: 'none',
                    background:
                      'transparent url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%276%27 viewBox=%270 0 10 6%27 fill=%27none%27><path d=%27M1 1l4 4 4-4%27 stroke=%27%236B7280%27 stroke-width=%271%27/></svg>") no-repeat right 4px center',
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select an area
                  </option>
                  <option>Press</option>
                  <option>Partnership</option>
                  <option>Programme</option>
                  <option>Newsletter</option>
                  <option>General enquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" style={labelStyle}>
                Message
              </label>
              <textarea
                id="message"
                placeholder="Tell us what you are reaching out about, who you are, and any relevant links or context."
                rows={5}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  borderBottom: '1px solid #E5E2D9',
                  border: '1px solid #E5E2D9',
                  padding: '12px',
                }}
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: '#6B7280',
                cursor: 'pointer',
              }}
            >
              <input type="checkbox" style={{ marginTop: 4, accentColor: '#97B73B' }} />
              <span>I would also like to receive newsletter updates from Resilience Frontiers.</span>
            </label>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              {submitted ? (
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#97B73B',
                  }}
                >
                  Thank you — we’ll be in touch.
                </p>
              ) : (
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.05em',
                    color: '#6B7280',
                  }}
                >
                  Press / partnership / programme / newsletter / general
                </span>
              )}
              <button type="submit" className="btn-primary">
                Send enquiry →
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
