import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("framer-motion")) {
              return "framer-motion-vendor";
            }
            if (id.includes("lucide-react")) {
              return "lucide-vendor";
            }
            if (id.includes("leaflet")) {
              return "leaflet-vendor";
            }
            if (id.includes("react-router-dom")) {
              return "router-vendor";
            }
            if (id.includes("react-hot-toast")) {
              return "toast-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
});
