/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#09090b",
        boldtext: "#2563eb",
        button: "#18181b",
        subtext: "#434343"
      }

    },
  },
  plugins: [],
}

