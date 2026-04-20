/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(74, 222, 128, 0.18), 0 18px 60px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
