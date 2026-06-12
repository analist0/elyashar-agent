import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/health": "http://localhost:3000",
      "/tool": "http://localhost:3000",
      "/agents": "http://localhost:3000",
      "/conversations": "http://localhost:3000",
      "/xai": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
