import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // JSX runtime 最適化
      jsxRuntime: 'automatic',
    }),
    // PWAプラグインを一時的に無効化（デバッグのため）
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['vite.svg'],
    //   manifest: {
    //     name: 'Work Time Tracker',
    //     short_name: 'TimeTracker',
    //     description: 'AI搭載のタスク管理・時間追跡アプリケーション',
    //     theme_color: '#ffffff',
    //     icons: [
    //       {
    //         src: 'vite.svg',
    //         sizes: '32x32',
    //         type: 'image/svg+xml',
    //       },
    //     ],
    //   },
    // }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // lodashのES module互換性を改善
      lodash: 'lodash',
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    chunkSizeWarningLimit: 500, // 警告サイズを500KBに下げる
    rollupOptions: {
      // Tree shaking 強化
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
      output: {
        manualChunks: {
          // Core React
          'react-core': ['react', 'react-dom'],

          // Routing
          'react-router': ['react-router-dom'],

          // UI Libraries (分割)
          'mui-core': ['@mui/material'],
          'mui-icons': ['@mui/icons-material'],
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-tooltip',
          ],

          // Charts (さらに分割)
          'charts-core': ['chart.js', 'react-chartjs-2'],
          'charts-recharts': ['recharts'],
          calendar: [
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
          ],

          // Utilities (分割)
          'date-utils': ['date-fns', 'date-fns-tz', 'moment'],
          'file-utils': ['lodash', 'uuid', 'file-saver', 'axios'],

          // State Management
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux'],

          // Firebase
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
            'firebase/analytics',
          ],

          // Form Libraries
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Animation & Effects
          animations: ['react-hot-toast', 'react-toastify'],

          // Development Tools
          'dev-tools': ['@anthropic-ai/sdk'],
        },
        // ファイル名を最適化
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'unknown';
          const info = name.split('.');
          const extType = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(name)) {
            return `media/[name]-[hash].${extType}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(name)) {
            return `img/[name]-[hash].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(name)) {
            return `fonts/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        },
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
    // gzip圧縮を有効化
    reportCompressedSize: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.NEXT_PUBLIC_OPENAI_API_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_OPENAI_API_KEY
    ),
    global: 'globalThis',
  },
  css: {
    postcss: './postcss.config.cjs',
  },
  // ⚡ パフォーマンス最適化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      'react-hot-toast',
      'lodash',
      'lodash/get',
      'lodash/isObject',
      'lodash/isArray',
      'react-is', // React 19対応
      'prop-types', // ESMエクスポート問題を解決
      'tailwindcss-animate', // Tailwind CSS Animate問題を解決
      'eventemitter3', // EventEmitter3のESMエクスポート問題を解決
    ],
    exclude: [
      // 重いライブラリを除外してオンデマンド読み込み
      '@anthropic-ai/sdk',
      'chart.js',
      'recharts',
      '@fullcalendar/core',
      // Node.jsモジュールは最適化から除外
      'events',
      'util',
      'buffer',
      'process',
    ],
    // ESM互換性の強制
    force: true,
    // CommonJS互換性の設定
    esbuildOptions: {
      target: 'esnext',
      platform: 'browser',
    },
  },
});
