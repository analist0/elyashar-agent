import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@pixiv/three-vrm"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
