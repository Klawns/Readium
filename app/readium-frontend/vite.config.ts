import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:7717',
        changeOrigin: true,
        // Não precisamos de rewrite aqui porque o backend já espera /api
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@embedpdf")) return "embedpdf";
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("@radix-ui")) return "radix";
          return "vendor";
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      manifest: {
        name: "Readium",
        short_name: "Readium",
        description: "Biblioteca pessoal para leitura de livros digitais",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#0f172a",
        background_color: "#f8fafc",
        icons: [
          {
            src: "/assets/favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
