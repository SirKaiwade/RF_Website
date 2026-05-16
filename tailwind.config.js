/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A1628',
        paper: '#FAFAF7',
        'frontier-blue': '#1E3A8A',
        horizon: '#5B8FB9',
        growth: '#4A7C59',
        signal: '#D97757',
        rule: '#E5E2D9',
        mute: '#6B7280',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(48px,7vw,96px)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-l': ['clamp(36px,5vw,64px)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-m': ['clamp(28px,3.5vw,40px)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'body-l': ['22px', { lineHeight: '1.5' }],
        'body-m': ['17px', { lineHeight: '1.6' }],
        'body-s': ['14px', { lineHeight: '1.5' }],
        'mono-s': ['13px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      maxWidth: {
        grid: '1440px',
      },
      transitionTimingFunction: {
        reveal: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        reveal: '600ms',
        hover: '200ms',
        state: '400ms',
      },
    },
  },
  plugins: [],
};
