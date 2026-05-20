import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        terracotta: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
        },
        cream: {
          50: '#FAFAF5',
          100: '#F5F5EF',
          200: '#EEEDE4',
        },
        navy: {
          900: '#1E1B2E',
          800: '#2A2640',
          700: '#3D3960',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Source Sans 3', 'Nunito', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        warm: '0 2px 8px rgba(79, 70, 229, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
        'warm-lg': '0 8px 24px rgba(79, 70, 229, 0.12), 0 4px 8px rgba(0,0,0,0.06)',
        'warm-xl': '0 16px 40px rgba(79, 70, 229, 0.15), 0 8px 16px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      backgroundImage: {
        'cream-gradient': 'linear-gradient(135deg, #FAFAF5 0%, #F5F5EF 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
