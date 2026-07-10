/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gold palette
        gold: {
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
          DEFAULT: '#D4AF37',
          light: '#F0C940',
          dark:  '#A88B2A',
        },
        // Black palette
        dark: {
          50:  '#f8f8f8',
          100: '#e8e8e8',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
          950: '#050505',
          DEFAULT: '#111111',
        },
        // Background
        bg: {
          primary:   '#0a0a0a',
          secondary: '#111111',
          card:      '#1a1a1a',
          elevated:  '#242424',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient':       'linear-gradient(135deg, #D4AF37 0%, #F0C940 50%, #A88B2A 100%)',
        'dark-gradient':       'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
        'card-gradient':       'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        'gold-radial':         'radial-gradient(circle, #F0C940 0%, #D4AF37 60%, #A88B2A 100%)',
        'hero-gradient':       'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #111111 100%)',
        'glass-gradient':      'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gold-border':         'linear-gradient(135deg, #D4AF37, #F0C940, #A88B2A)',
      },
      boxShadow: {
        'gold':    '0 4px 24px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 8px 40px rgba(212, 175, 55, 0.4)',
        'gold-sm': '0 2px 12px rgba(212, 175, 55, 0.2)',
        'dark':    '0 4px 24px rgba(0, 0, 0, 0.6)',
        'dark-lg': '0 8px 40px rgba(0, 0, 0, 0.8)',
        'glass':   '0 8px 32px rgba(0, 0, 0, 0.4)',
        'inner-gold': 'inset 0 1px 0 rgba(212, 175, 55, 0.2)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '1.5rem',
      },
      animation: {
        'pulse-gold':    'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':       'shimmer 1.5s infinite',
        'float':         'float 3s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '.7', boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(212,175,55,0.3)' },
          to:   { boxShadow: '0 0 30px rgba(212,175,55,0.7)' },
        },
      },
      screens: {
        'xs': '360px',
        'sm': '390px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
