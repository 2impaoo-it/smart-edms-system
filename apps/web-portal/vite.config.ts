import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_BACKEND_URL || 'http://localhost:8080';
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // Listen on all network interfaces for Docker
      port: 5173,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
        }
      }
    },
    preview: {
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
        }
      }
    }
  };
});
