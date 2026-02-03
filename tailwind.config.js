/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      spacing: {
        '4.5': '1.125rem',
        '15': '3.75rem',
      },
    },
  },
  plugins: [],
  darkMode: ['selector', '[data-theme="dark"]'],
}
