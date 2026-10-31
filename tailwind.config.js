/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Luxury Emerald Identity
        emerald: {
          DEFAULT: '#103C32',
          dark: '#0C2C24',
          light: '#164F42',
          lighter: '#236A5B',
        },
        forest: {
          DEFAULT: '#263B34',
          dark: '#1B2C26',
          light: '#334D44',
        },
        gold: {
          DEFAULT: '#C6A45B',
          light: '#D8BC79',
          dark: '#A8863D',
          subtle: '#F0E7D2',
        },
        ivory: {
          DEFAULT: '#F4F1EA',
          dark: '#ECE7DD',
          light: '#FAF8F4',
        },
        beige: {
          DEFAULT: '#D8D2C6',
          dark: '#C4BCAD',
          light: '#E6E1D8',
        },
        textPrimary: '#24352E',
        textSecondary: '#777D76',
        // Backward-compatible semantic aliases
        primary: {
          DEFAULT: '#103C32',
          light: '#164F42',
          lighter: '#236A5B',
          dark: '#0C2C24',
        },
        surface: {
          DEFAULT: '#F4F1EA',
          card: '#FFFFFF',
          dark: '#263B34',
        },
        dark: {
          DEFAULT: '#103C32',
          100: '#0C2C24',
          200: '#1B2C26',
          300: '#263B34',
          400: '#334D44',
        },
      },
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', '"Readex Pro"', 'sans-serif'],
        readex: ['"Readex Pro"', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        editorial: ['"Cormorant Garamond"', 'serif'],
        sans: ['"IBM Plex Sans Arabic"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'luxury': '14px',
        'luxury-lg': '16px',
        'luxury-sm': '10px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0C2C24 0%, #103C32 50%, #263B34 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #103C32 0%, #164F42 50%, #0C2C24 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C6A45B 0%, #D8BC79 50%, #A8863D 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.7s ease-out',
        'slide-in-right': 'slideInRight 0.7s ease-out',
        'slide-in-left': 'slideInLeft 0.7s ease-out',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 168, 76, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 168, 76, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'luxury': '0 20px 60px rgba(0,0,0,0.15)',
        'luxury-dark': '0 20px 60px rgba(0,0,0,0.5)',
        'gold': '0 4px 20px rgba(201, 168, 76, 0.4)',
        'green': '0 4px 20px rgba(27, 67, 50, 0.4)',
      },
      transitionTimingFunction: {
        'ogw-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        'ogw-swift': 'cubic-bezier(0.625, 0.05, 0, 1)',
        'ogw-smooth': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};
