/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#103C32',
          light: '#174B3F',
          lighter: '#28705C',
          dark: '#0B2D25',
        },
        gold: {
          DEFAULT: '#C6A45B',
          light: '#D8BC7A',
          dark: '#A9823E',
        },
        dark: {
          DEFAULT: '#263B34',
          100: '#17352C',
          200: '#1D4035',
          300: '#244A3D',
          400: '#315347',
        },
        surface: {
          DEFAULT: '#F4F1EA',
          dark: '#EEEAE1',
        },
      },
      fontFamily: {
        arabic: ['Alexandria', 'Tajawal', 'sans-serif'],
        english: ['Inter', 'Outfit', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0B2D25 0%, #103C32 58%, #263B34 100%)',
        'gold-gradient': 'linear-gradient(135deg, #A9823E 0%, #C6A45B 50%, #D8BC7A 100%)',
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
        'gold': '0 4px 20px rgba(198, 164, 91, 0.28)',
        'green': '0 4px 20px rgba(16, 60, 50, 0.18)',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};
