// Tailwind CSS v4 uses a PostCSS plugin. There is intentionally NO tailwind.config.js:
// v4 is configured in CSS (see app/globals.css -> @import "tailwindcss" and @theme).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
