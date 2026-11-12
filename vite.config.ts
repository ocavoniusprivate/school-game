import { defineConfig } from "vite";

// GitHub Pages serves the site under /school-game/, so all asset URLs need
// that prefix in the production build.
export default defineConfig({
  base: "/school-game/",
});
