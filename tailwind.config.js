/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#B91C1C',
          'red-dark': '#991B1B',
          'red-light': '#EF4444',
          orange: '#F59E0B',
          amber: '#D97706',
          yellow: '#FBBF24',
          cream: '#FFF4E0',
          'cream-dark': '#E9D8B4',
          dark: '#0C0A09',
          surface: '#1C1917',
          'surface-light': '#292524',
          border: '#38302B'
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Rubik', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 20px -3px rgba(185, 28, 28, 0.4)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
