/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'Fira Code'", "monospace"],
        display: ["'Cabinet Grotesk'", "'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#fff8ed",
          100: "#ffefd4",
          200: "#ffd9a8",
          300: "#ffbc71",
          400: "#ff9438",
          500: "#ff7410",
          600: "#f05a06",
          700: "#c74207",
          800: "#9e3510",
          900: "#7f2e10",
        },
        surface: {
          50:  "#f8f9fb",
          100: "#f0f2f7",
          200: "#e2e6ef",
          300: "#c9d0e0",
          800: "#1a1d27",
          850: "#141620",
          900: "#0f1018",
          950: "#090a12",
        },
      },
      boxShadow: {
        "glow-brand": "0 0 20px rgba(255,116,16,0.25)",
        "glow-sm": "0 0 8px rgba(255,116,16,0.15)",
        "card": "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
        "card-dark": "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "fade-up": "fadeUp 0.35s ease forwards",
        "slide-in-left": "slideInLeft 0.3s ease forwards",
        "slide-in-right": "slideInRight 0.3s ease forwards",
        "spin-slow": "spin 2s linear infinite",
        "pulse-brand": "pulseBrand 2s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        "bounce-dots": "bounceDots 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeUp: { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideInLeft: { from: { opacity: 0, transform: "translateX(-16px)" }, to: { opacity: 1, transform: "translateX(0)" } },
        slideInRight: { from: { opacity: 0, transform: "translateX(16px)" }, to: { opacity: 1, transform: "translateX(0)" } },
        pulseBrand: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceDots: {
          "0%,80%,100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
