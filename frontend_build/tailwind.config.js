
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        backgroundPurple: "#532B75",
        spotifyYellow: "#FFD700",
      },
      fontFamily: {
        title: ["'Luckiest Guy'", "cursive"],
        body: ["'Vesper Libre'", "serif"],
      }
    },
  },
  plugins: [],
}
