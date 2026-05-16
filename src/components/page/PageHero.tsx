import { type ReactNode } from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: string;
  align?: 'left' | 'center';
}

const FLOW_LINES = [
  { d: 'M-20 180 Q 180 60 420 140 Q 660 220 900 100', delay: 0, dur: 14 },
  { d: 'M-20 220 Q 200 120 440 200 Q 680 280 920 160', delay: 1.5, dur: 16 },
  { d: 'M-20 150 Q 160 80 380 170 Q 600 260 880 130', delay: 3, dur: 12 },
  { d: 'M0 300 Q 220 180 460 260 Q 700 340 940 220', delay: 2, dur: 18 },
  { d: 'M40 100 Q 260 40 500 120 Q 740 200 980 80', delay: 4, dur: 13 },
  { d: 'M60 380 Q 280 300 520 360 Q 760 420 1000 320', delay: 1, dur: 17 },
  { d: 'M-40 260 Q 180 170 420 250 Q 660 330 900 210', delay: 3.2, dur: 17 },
  { d: 'M260 -20 Q 480 -60 720 0 Q 960 60 1200 -40', delay: 3.8, dur: 15 },
];

export default function PageHero({
  eyebrow,
  title,
  lede,
  meta,
  align = 'left',
}: PageHeroProps) {
  return (
    <section
      style={{
        backgroundColor: '#0A1628',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'clamp(140px, 18vh, 200px)',
        paddingBottom: 'clamp(80px, 12vh, 120px)',
      }}
    >
      {/* Ambient drift */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.55,
        }}
      >
        {FLOW_LINES.map((line, i) => (
          <path
            key={i}
            d={line.d}
            fill="none"
            stroke={i % 3 === 0 ? '#97B73B' : '#FAFAF7'}
            strokeWidth="0.6"
            strokeOpacity={0.07 + (i % 5) * 0.02}
            style={{
              animation: `ambient-drift ${line.dur}s ${line.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </svg>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px',
          textAlign: align,
        }}
      >
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#97B73B',
            marginBottom: 16,
          }}
        >
          {eyebrow}
        </p>
        <h1
          style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 'clamp(40px, 6vw, 88px)',
            lineHeight: 1.04,
            letterSpacing: '-0.022em',
            color: '#FAFAF7',
            fontWeight: 300,
            margin: 0,
            maxWidth: align === 'center' ? 1100 : 1100,
            marginLeft: align === 'center' ? 'auto' : undefined,
            marginRight: align === 'center' ? 'auto' : undefined,
          }}
        >
          {title}
        </h1>
        {lede && (
          <p
            style={{
              marginTop: 28,
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(17px, 1.5vw, 21px)',
              lineHeight: 1.55,
              color: 'rgba(250,250,247,0.72)',
              maxWidth: 720,
              marginLeft: align === 'center' ? 'auto' : undefined,
              marginRight: align === 'center' ? 'auto' : undefined,
            }}
          >
            {lede}
          </p>
        )}
        {meta && (
          <div
            style={{
              marginTop: 40,
              borderTop: '1px solid rgba(250,250,247,0.12)',
              paddingTop: 16,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(250,250,247,0.4)',
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </section>
  );
}
