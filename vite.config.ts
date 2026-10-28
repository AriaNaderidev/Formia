import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

/** Long-lived vendor chunks: they stay cached across app deploys. */
const VENDOR_CHUNKS: Record<string, string[]> = {
  react: ["react", "react-dom", "scheduler"],
  mui: ["@mui", "@emotion", "@popperjs", "react-transition-group", "stylis"],
  forms: ["react-hook-form", "@hookform", "zod"],
  dnd: ["@dnd-kit"],
};

const chunkFor = (id: string) => {
  // Windows paths use backslashes; normalise so one pattern works everywhere.
  const path = id.replace(/\\/g, "/");
  // Rollup's CJS interop helper is shared by every vendor chunk. Left alone it lands in
  // `mui`, which makes `react` and `mui` import each other and the app dies on load
  // ("Cannot access ... before initialization"). `react` imports nothing, so it goes there.
  if (path.includes("commonjsHelpers")) return "react";
  return Object.keys(VENDOR_CHUNKS).find((name) =>
    VENDOR_CHUNKS[name].some((pkg) => path.includes(`/node_modules/${pkg}/`)),
  );
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // The formatter worker lazy-loads Prettier, which needs code-splitting (not IIFE output).
  worker: { format: "es" },
  build: {
    rollupOptions: {
      output: {
        manualChunks: chunkFor,
      },
    },
  },
});
