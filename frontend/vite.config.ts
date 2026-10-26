import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Your local backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Remove /api if backend expects naked paths
        secure: false, // Only for local dev with HTTP
      },
    },
  },
});
