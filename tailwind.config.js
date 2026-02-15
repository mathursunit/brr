/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec7ff',
          400: '#59a7ff',
          500: '#3384fc',
          600: '#1d64f2',
          700: '#154fde',
          800: '#1840b4',
          900: '#1a3a8e',
          950: '#152556',
        },
        ice: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0ca5eb',
          600: '#0084c9',
          700: '#0169a3',
          800: '#065886',
          900: '#0b4a6f',
          950: '#072f4a',
        },
        frost: {
          50: '#f3f6fc',
          100: '#e5ecf9',
          200: '#c6d6f1',
          300: '#93b3e5',
          400: '#5a8cd5',
          500: '#356ec1',
          600: '#2555a3',
          700: '#1f4484',
          800: '#1e3c6e',
          900: '#1e345c',
          950: '#14213d',
        },
        snow: {
          50: '#fafcff',
          100: '#f0f5ff',
          200: '#e8effa',
          300: '#d5e0f0',
          400: '#b8c9e4',
          500: '#94abd4',
        },
        fire: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        crimson: {
          400: '#f87171',
          500: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 60s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'aurora-1': 'aurora1 15s ease-in-out infinite',
        'aurora-2': 'aurora2 20s ease-in-out infinite',
        'aurora-3': 'aurora3 25s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        aurora1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)', opacity: '0.5' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)', opacity: '0.2' },
        },
        aurora2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.2' },
          '50%': { transform: 'translate(-40px, 30px) scale(1.2)', opacity: '0.4' },
        },
        aurora3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1.1)', opacity: '0.15' },
          '33%': { transform: 'translate(50px, 20px) scale(0.8)', opacity: '0.3' },
          '66%': { transform: 'translate(-30px, -40px) scale(1)', opacity: '0.2' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
