import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://api.memorisehub.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
