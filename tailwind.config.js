/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4493cf',
        secondary: '#5cbd74',
        accent: '#f15e60',
        background: '#ffffff',
        'text-primary': '#302d30',
        'text-secondary': '#666666',
      },
      fontFamily: {
        sans: ['Barlow Semi Condensed', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 