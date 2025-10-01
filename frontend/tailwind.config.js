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
          50: '#e6f4ea',
          100: '#c3e6cb',
          200: '#9cd7a8',
          300: '#75c885',
          400: '#57bc6b',
          500: '#39b050', // Nigerian green
          600: '#33a048',
          700: '#2c8e3e',
          800: '#247d35',
          900: '#175c25',
        },
        secondary: {
          50: '#fff',
          100: '#f9f9f9',
          200: '#f0f0f0',
          300: '#e0e0e0',
          400: '#c0c0c0',
          500: '#a0a0a0',
          600: '#808080',
          700: '#606060',
          800: '#404040',
          900: '#202020',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
