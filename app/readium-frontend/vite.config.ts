import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { defineConfig } from "vite";

const resolvePackageName = (id: string): string | null => {
  const normalizedPath = id.replaceAll("\\", "/");
  const packageMatch = normalizedPath.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  return packageMatch?.[1] ?? null;
};

const toVendorChunkName = (packageName: string) =>
  `vendor-${packageName.replace("@", "").replaceAll("/", "-")}`;

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
          if (!id.includes("node_modules")) {
            return undefined;
          }

          const packageName = resolvePackageName(id);
          if (!packageName) {
            return "vendor";
          }

          if (packageName === "@embedpdf/engines") return "embedpdf-engine";
          if (packageName.startsWith("@embedpdf/plugin-")) return "embedpdf-plugins";
          if (packageName === "@embedpdf/core") return "embedpdf-core";
          if (packageName === "@tanstack/react-query" || packageName === "@tanstack/query-core") return "tanstack-query";
          if (packageName === "@tanstack/react-virtual") return "tanstack-virtual";
          if (packageName.startsWith("@radix-ui/")) return "radix-ui";
          if (packageName === "react-router" || packageName === "react-router-dom") return "react-router";
          if (packageName === "react" || packageName === "react-dom" || packageName === "scheduler") return "react-core";
          if (packageName === "lucide-react") return "icons";
          if (packageName === "dexie") return "offline-storage";
          if (packageName === "recharts") return "charts";

          return toVendorChunkName(packageName);
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
