import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#05030f',
          900: '#0a0a2a',
          800: '#0e1a4a',
          700: '#1a1640',
        },
        purple: {
          DEFAULT: '#2a1a5e',
          bright: '#6a4cff',
        },
        gold: {
          DEFAULT: '#ffcc33',
          bright: '#ffe066',
        },
        cyan: '#66e0ff',
        pixel: {
          red: '#ff4d4d',
          green: '#33ff88',
          blue: '#2a4cff',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        vt: ['VT323', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'blink-slow': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0.3' },
        },
        'pulse-glow': {
          '0%, 100%': {
            filter: 'brightness(1) drop-shadow(0 0 8px #ffcc33)',
          },
          '50%': {
            filter: 'brightness(1.3) drop-shadow(0 0 20px #ffe066)',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-3px)' },
          '40%': { transform: 'translateX(3px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        ticker: {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        blink: 'blink 1s steps(1,end) infinite',
        'blink-slow': 'blink-slow 0.8s steps(1) infinite',
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        ticker: 'ticker 40s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
