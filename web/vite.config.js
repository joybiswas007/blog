import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3001
  },
  resolve: {
    alias: {
      "@/": `${resolve(__dirname, "src")}/`
    }
  },
  build: {
    manifest: true
  }
});
