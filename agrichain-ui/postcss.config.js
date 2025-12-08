// postcss.config.js
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [
    tailwindcss(), // ✅ New Tailwind v4 PostCSS plugin
    autoprefixer(), // ✅ Auto adds vendor prefixes for cross-browser support
  ],
};
