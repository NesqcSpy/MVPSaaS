import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem' },
    extend: {
      colors: {
        // Brand palette — operational, infrastructure-grade, dark-first.
        bg: {
          base: '#0B1020',
          deep: '#0F172A',
          surface: '#111827',
        },
        surface: {
          DEFAULT: '#1E293B',
          muted: '#1F2937',
        },
        brand: {
          primary: '#3B82F6',
          secondary: '#06B6D4',
          accent: '#8B5CF6',
        },
        state: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#06B6D4',
        },
        ink: {
          high: '#F8FAFC',
          mid: '#CBD5E1',
          low: '#94A3B8',
        },
        border: {
          DEFAULT: 'rgba(148, 163, 184, 0.12)',
          strong: 'rgba(148, 163, 184, 0.24)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,0.35), 0 8px 32px -8px rgba(59,130,246,0.45)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grid-faint':
          "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.08) 1px, transparent 0)",
        'gradient-brand':
          'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [animate],
};

export default config;
