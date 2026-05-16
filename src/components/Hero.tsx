import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

const Globe = lazy(() => import('./Globe'));

const FLOW_LINES = [
  { d: 'M-20 180 Q 180 60 420 140 Q 660 220 900 100', delay: 0, dur: 14 },
  { d: 'M-20 220 Q 200 120 440 200 Q 680 280 920 160', delay: 1.5, dur: 16 },
  { d: 'M-20 150 Q 160 80 380 170 Q 600 260 880 130', delay: 3, dur: 12 },
  { d: 'M0 300 Q 220 180 460 260 Q 700 340 940 220', delay: 2, dur: 18 },
  { d: 'M0 340 Q 240 240 480 310 Q 720 380 960 260', delay: 0.5, dur: 15 },
  { d: 'M40 100 Q 260 40 500 120 Q 740 200 980 80', delay: 4, dur: 13 },
  { d: 'M60 380 Q 280 300 520 360 Q 760 420 1000 320', delay: 1, dur: 17 },
  { d: 'M80 430 Q 300 350 540 410 Q 780 470 1020 370', delay: 3.5, dur: 14 },
  { d: 'M100 60 Q 320 20 560 80 Q 800 140 1040 40', delay: 2.5, dur: 16 },
  { d: 'M120 480 Q 340 400 580 460 Q 820 520 1060 420', delay: 0.8, dur: 19 },
  { d: 'M140 30 Q 360 -10 600 50 Q 840 110 1080 10', delay: 4.5, dur: 13 },
  { d: 'M160 530 Q 380 450 620 510 Q 860 570 1100 470', delay: 1.8, dur: 15 },
  { d: 'M-40 260 Q 180 170 420 250 Q 660 330 900 210', delay: 3.2, dur: 17 },
  { d: 'M200 580 Q 420 500 660 560 Q 900 620 1140 520', delay: 0.3, dur: 14 },
  { d: 'M220 20 Q 440 -20 680 40 Q 920 100 1160 0', delay: 2.8, dur: 16 },
  { d: 'M-60 400 Q 160 320 400 380 Q 640 440 880 340', delay: 4.2, dur: 18 },
  { d: 'M240 630 Q 460 550 700 610 Q 940 670 1180 570', delay: 1.2, dur: 12 },
  { d: 'M260 -20 Q 480 -60 720 0 Q 960 60 1200 -40', delay: 3.8, dur: 15 },
  { d: 'M280 680 Q 500 600 740 660 Q 980 720 1220 620', delay: 0.6, dur: 17 },
  { d: 'M-80 460 Q 140 380 380 440 Q 620 500 860 400', delay: 2.2, dur: 13 },
];

export default function Hero() {
  return (
    <section
      id="top"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A1628',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '160px',
        paddingBottom: '96px',
      }}
    >
      {/* Forest backdrop — original RF imagery */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/rf/hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.22,
          filter: 'saturate(0.85)',
        }}
      />

      {/* Tinted overlay to anchor the navy palette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.7) 38%, rgba(10,22,40,0.94) 100%)',
        }}
      />

      {/* SVG flow field — connective foresight motif */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {FLOW_LINES.map((line, i) => (
          <path
            key={i}
            d={line.d}
            fill="none"
            stroke="#FAFAF7"
            strokeWidth="0.6"
            strokeOpacity={0.06 + (i % 5) * 0.02}
            style={{
              animation: `ambient-drift ${line.dur}s ${line.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const startX = 720 + Math.cos(angle) * 900;
          const startY = 350 + Math.sin(angle) * 600;
          const ctrlX = 720 + Math.cos(angle) * 300;
          const ctrlY = 350 + Math.sin(angle) * 200;
          const accent = i % 4 === 0 ? '#97B73B' : '#5B8FB9';
          return (
            <path
              key={`conv-${i}`}
              d={`M${startX} ${startY} Q${ctrlX} ${ctrlY} 720 350`}
              fill="none"
              stroke={accent}
              strokeWidth="0.4"
              strokeOpacity={i % 4 === 0 ? 0.06 : 0.05}
              style={{
                animation: `ambient-drift ${12 + i * 0.5}s ${i * 0.3}s ease-in-out infinite alternate`,
              }}
            />
          );
        })}
      </svg>

      {/* UNFCCC affiliation badge */}
      <div
        style={{
          position: 'absolute',
          top: '116px',
          left: '48px',
          right: '48px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 5,
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(250, 250, 247, 0.45)',
          }}
        >
          UNFCCC — Adaptation Programme
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(250, 250, 247, 0.12)',
          }}
        />
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(250, 250, 247, 0.45)',
          }}
        >
          Est. 2019 — Songdo
        </span>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 48,
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        {/* Left: text */}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#97B73B',
              marginBottom: '20px',
              animation: 'fadeUp 600ms 100ms cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            Foresight for climate-resilient futures beyond 2030
          </p>

          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(40px, 5.4vw, 84px)',
              lineHeight: 1,
              letterSpacing: '-0.025em',
              color: '#FAFAF7',
              fontWeight: 300,
              marginBottom: '20px',
              animation: 'fadeUp 600ms 200ms cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            Resilience{' '}
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>Frontiers</em>
          </h1>

          {/* Brand signature line */}
          <p
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 1.9vw, 26px)',
              lineHeight: 1.15,
              color: 'rgba(250, 250, 247, 0.88)',
              marginBottom: '28px',
              letterSpacing: '-0.005em',
              animation: 'fadeUp 600ms 280ms cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            where<span style={{ color: '#97B73B', fontStyle: 'normal' }}>.</span>{' '}
            the<span style={{ color: '#97B73B', fontStyle: 'normal' }}>.</span>{' '}
            future<span style={{ color: '#97B73B', fontStyle: 'normal' }}>.</span>{' '}
            is<span style={{ color: '#97B73B', fontStyle: 'normal' }}>.</span>{' '}
            <strong style={{ fontWeight: 500, color: '#FAFAF7' }}>Now.</strong>
          </p>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              lineHeight: 1.55,
              color: 'rgba(250, 250, 247, 0.72)',
              maxWidth: '560px',
              marginBottom: '32px',
              animation: 'fadeUp 600ms 360ms cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            A UN-catalysed initiative using foresight methodologies to build
            climate-resilient pathways across eight transformational domains —
            shifting our thinking into the future, to move us toward a desirable
            world.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              animation: 'fadeUp 600ms 440ms cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            <Link
              to="/pathways"
              style={{
                display: 'inline-block',
                backgroundColor: '#FAFAF7',
                color: '#0A1628',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '14px 24px',
                borderRadius: 0,
                border: '1px solid #FAFAF7',
                textDecoration: 'none',
                transition:
                  'background-color 200ms ease, color 200ms ease, border-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = '#97B73B';
                el.style.borderColor = '#97B73B';
                el.style.color = '#0A1628';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = '#FAFAF7';
                el.style.borderColor = '#FAFAF7';
                el.style.color = '#0A1628';
              }}
            >
              Explore the Eight Pathways
            </Link>
            <Link
              to="/about"
              style={{
                display: 'inline-block',
                backgroundColor: 'transparent',
                color: '#FAFAF7',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '14px 24px',
                borderRadius: 0,
                border: '1px solid rgba(250, 250, 247, 0.3)',
                textDecoration: 'none',
                transition: 'border-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  'rgba(250, 250, 247, 0.7)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  'rgba(250, 250, 247, 0.3)';
              }}
            >
              About the Initiative
            </Link>
          </div>
        </div>

        {/* Right: 3D globe */}
        <div
          className="hero-globe-wrap"
          style={{
            position: 'relative',
            minWidth: 0,
            width: '100%',
            maxWidth: 680,
            justifySelf: 'end',
            animation: 'fadeIn 1200ms 500ms ease both',
          }}
        >
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(91,143,185,0.18), rgba(10,22,40,0) 70%)',
                }}
              />
            }
          >
            <Globe />
          </Suspense>
        </div>
      </div>

      {/* Stat strip — anchors the bottom edge */}
      <div
        style={{
          position: 'relative',
          zIndex: 8,
          maxWidth: 1440,
          margin: '0 auto',
          padding: '40px 48px 0',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          borderTop: '1px solid rgba(250,250,247,0.1)',
          paddingTop: 24,
          marginTop: 56,
          animation: 'fadeUp 600ms 700ms cubic-bezier(0.16,1,0.3,1) both',
        }}
        className="hero-stats"
      >
        {[
          { num: '08', label: 'Pathways of transformation' },
          { num: '16', label: 'Live milestones, 2018–2023' },
          { num: '12', label: 'Cities convened' },
          { num: '02', label: 'LEAP editions published' },
        ].map((s) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(20px, 2vw, 28px)',
                fontWeight: 300,
                color: '#FAFAF7',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}
            >
              {s.num}
            </span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(250,250,247,0.45)',
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ambient-drift {
          from { transform: translateY(0px) translateX(0px); }
          to { transform: translateY(-8px) translateX(4px); }
        }
        @media (max-width: 899px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-globe-wrap {
            display: none !important;
          }
          .hero-stats {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}
