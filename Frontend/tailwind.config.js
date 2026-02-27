/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', '"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Obsidian Clinical — core palette */
        obsidian: {
          50:  '#e8ecf4',
          100: '#c5cde0',
          200: '#94a3b8',
          300: '#64748b',
          400: '#475569',
          500: '#334155',
          600: '#1e293b',
          700: '#151d32',
          800: '#111827',
          900: '#0c1222',
          950: '#0a0f1e',
        },
        primary: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        medical: {
          cyan: '#22d3ee',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          dark: '#0a0f1e',
          surface: '#111827',
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#f43f5e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'glow': 'glowPulse 2s ease-in-out infinite',
        'orb': 'orbFloat 15s ease-in-out infinite',
        'orb-reverse': 'orbFloat 18s ease-in-out infinite reverse',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(34, 211, 238, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.7)' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(-10px, 20px) scale(0.95)' },
          '75%': { transform: 'translate(-30px, -10px) scale(1.02)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dot-grid': 'radial-gradient(circle, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(34, 211, 238, 0.1)',
        'glow': '0 0 20px rgba(34, 211, 238, 0.15), 0 0 60px rgba(34, 211, 238, 0.05)',
        'glow-lg': '0 0 40px rgba(34, 211, 238, 0.2), 0 0 80px rgba(34, 211, 238, 0.1)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.15), 0 0 60px rgba(245, 158, 11, 0.05)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.15), 0 0 60px rgba(244, 63, 94, 0.05)',
        'dark-lg': '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
