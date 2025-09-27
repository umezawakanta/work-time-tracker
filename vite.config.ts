import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
        'process.env.REACT_APP_VERSION': JSON.stringify('1.3.2'),
  },
  server: {
    port: 9000,
    proxy: {
      '/api': {
        target: 'https://work-time-tracker-five.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});