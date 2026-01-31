/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a', // green-600
        secondary: '#374151', // gray-700
      },
    },
  },
  
  plugins: [],
}