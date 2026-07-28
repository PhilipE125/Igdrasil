import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    clearMocks: true,
    // forks pool lets us preload a script that patches Module._load before
    // jsdom initialises — needed because jsdom's canvas-detection code calls
    // require("canvas") outside a try/catch, crashing when the native .node
    // binary is absent (canvas is installed as a transitive dep but uncompiled).
    pool: "forks",
    poolOptions: {
      forks: {
        execArgv: ["--require", path.resolve(__dirname, "src/test/patchCanvas.cjs")],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // canvas native addon is unavailable in the test environment; stub it out
      // so jsdom can initialize without failing on the missing .node binary.
      canvas: path.resolve(__dirname, "./src/__mocks__/canvas.cjs"),
    },
  },
});
