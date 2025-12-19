/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1E3A8A",
          secondary: "#10B981"
        }
      }
    }
  },
  plugins: []
};
