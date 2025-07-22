/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // THIS LINE IS CRITICAL: It tells Tailwind where to find your classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}