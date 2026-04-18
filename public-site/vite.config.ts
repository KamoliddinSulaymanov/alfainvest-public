import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      protocol: "wss",
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Widget HTML proxy — maps /widget/:id → CMS /public/widget/:id
      // This makes window.location.href inside the iframe a real http://
      // URL (same origin as the public site), so the bank API accepts it.
      "/widget": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/widget/, "/public/widget"),
      },
    },
  },
});
