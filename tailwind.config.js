module.exports = {
  content: ["./frontend/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        electricblue: "#2F80ED",
        slategray:   "#2D3748",
        neongreen:   "#00FFC6",
        offwhite:    "#F7FAFC",
        darkblue:    "#1C64F2",
      },
    },
  },
  plugins: [],
}
export default {
  // or module.exports = { … } if you’re not using ESM
  darkMode: 'media', // respect OS setting; or 'class' to toggle manually
  theme: {
    extend: {
      // …your custom colors, offwhite, etc…
    }
  },
  plugins: []
}
