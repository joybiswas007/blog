import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

let devProxyServer = "http://localhost:8080";
if (process.env.DEV_PROXY_SERVER && process.env.DEV_PROXY_SERVER.length > 0) {
  console.log(
    "Use devProxyServer from environment: ",
    process.env.DEV_PROXY_SERVER
  );
  devProxyServer = process.env.DEV_PROXY_SERVER;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    proxy: {
      "^/api": {
        target: devProxyServer,
        xfwd: true
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "dist"
  },
  preview: {
    host: "0.0.0.0",
    port: 3002
  }
});
