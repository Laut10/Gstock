/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef7ff',
          500: '#0c8ce9',
          600: '#0a72bf',
          700: '#085a96',
        },
      },
    },
  },
  plugins: [],
};
