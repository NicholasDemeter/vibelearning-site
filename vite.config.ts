import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ✅ Base path for deployment (required for GitHub Pages or custom domains)
  base: "/",

  // Local development server settings
  server: {
    host: "::",
    port: 8080,
  },

  // Plugins for React and Lovable (development only)
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  // Aliases for cleaner imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
