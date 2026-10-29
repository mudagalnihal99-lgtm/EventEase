/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FBFAF6",
          100: "#F5F2EB",
          200: "#EAE5D9",
          300: "#D9D2C2",
        },
        charcoal: {
          DEFAULT: "#292C28",
          700: "#3D413C",
          500: "#5E635B",
          400: "#81867D",
        },
        ember: {
          DEFAULT: "#B85C38",
          dark: "#9A4A2A",
          light: "#F0DDD3",
        },
        ok: "#4F6B4A",
        warn: "#A87420",
        danger: "#A33A2E",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
