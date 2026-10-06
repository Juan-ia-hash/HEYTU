/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2F80ED',
          violet: '#7C5CFC',
          yellow: '#FFC83D',
          coral: '#FF6B5E',
          cream: '#FFF9F0',
          ink: '#17233C',
          muted: '#758096',
          line: '#EEE8DF',
          green: '#3C9B7A',
        },
      },
    },
  },
  plugins: [],
};
