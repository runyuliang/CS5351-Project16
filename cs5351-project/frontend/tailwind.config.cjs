/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        jiraBlue: "#0052CC",
        jiraLight: "#F4F5F7",
      }
    }
  },
  plugins: [],
}