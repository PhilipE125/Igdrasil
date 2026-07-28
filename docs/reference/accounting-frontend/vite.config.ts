import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import path from "path";
import { componentTagger } from "lovable-tagger";

const rawBasePath = process.env.VITE_BASE_PATH || "/";
const normalizedBasePath =
  rawBasePath === "/"
    ? "/"
    : `/${rawBasePath.replace(/^\/+|\/+$/g, "")}/`;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: normalizedBasePath,
  // Read .env files from the monorepo root (one level up) so all VITE_* vars
  // defined in the root .env are available to the frontend dev server and build.
  envDir: path.resolve(__dirname, ".."),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Proxy /api/* to the local FastAPI backend so VITE_API_BASE_URL can stay
    // empty in dev. All fetch calls resolve correctly without CORS issues.
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  optimizeDeps: {
    include: ["agentation"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
