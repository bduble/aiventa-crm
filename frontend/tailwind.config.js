export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'media', // respect OS setting; or 'class' to toggle manually
  theme: {
    extend: {
      colors: {
        electricblue: "#2F80ED",
        slategray:   "#2D3748",
        neongreen:   "#00FFC6",
        offwhite:    "#F7FAFC",
        darkblue:    "#1C64F2",
      },
      keyframes: {
        logoCycle: {
          '0%':    { backgroundColor: '#FAA61A' },
          '12.5%': { backgroundColor: '#3CB043' },
          '25%':   { backgroundColor: '#A4C639' },
          '37.5%': { backgroundColor: '#FCE205' },
          '50%':   { backgroundColor: '#EC008C' },
          '62.5%': { backgroundColor: '#7B1FA2' },
          '75%':   { backgroundColor: '#00B3C7' },
          '87.5%': { backgroundColor: '#0066CC' },
          '100%':  { backgroundColor: '#FAA61A' },
        },
      },
      animation: {
        logoCycle: 'logoCycle 15s ease-in-out infinite',
      },
      boxShadow: {
        frame: '0 0 20px rgba(var(--current-bg-rgb),0.6)',
      },
    },
  },
  plugins: [],
};
