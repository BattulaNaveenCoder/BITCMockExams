/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#0078D4',
          DEFAULT: '#0078D4',
        },
        secondary: {
          blue: '#106EBE',
          DEFAULT: '#106EBE',
        },
        accent: {
          blue: '#50E6FF',
          DEFAULT: '#50E6FF',
        },
        dark: {
          blue: '#004578',
          DEFAULT: '#004578',
        },
        light: {
          blue: '#E6F4FF',
          DEFAULT: '#E6F4FF',
        },
        bg: {
          light: '#F5F5F5',
          gray: '#E5E5E5',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#666666',
          light: '#999999',
        },
        border: {
          DEFAULT: '#DDDDDD',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-in',
        scaleIn: 'scaleIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
