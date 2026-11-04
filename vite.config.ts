import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
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
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // "prompt": a new service worker waits until the user accepts, so a reload never wipes unsaved work.
      registerType: "prompt",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Formia: Form Generator",
        short_name: "Formia",
        description:
          "Drag fields onto a canvas, preview the form live, and export it as a JSON schema or React code.",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#fbf8fc",
        theme_color: "#522d60",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the shell plus every lazy chunk (Prettier, syntax highlighting) so
        // the Code tab works offline too. The app has no API, so nothing else is cached.
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
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
