import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          radix: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
          ],
          charts: [
            'chart.js',
            'react-chartjs-2',
            'recharts',
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
          ],
          utils: ['date-fns', 'date-fns-tz', 'moment', 'lodash', 'uuid', 'file-saver'],
          state: ['@reduxjs/toolkit', 'react-redux', 'redux'],
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
            'firebase/analytics',
          ],
        },
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.NEXT_PUBLIC_OPENAI_API_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_OPENAI_API_KEY
    ),
  },
  css: {
    postcss: './postcss.config.cjs',
  },
});
