import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  base: '/', // Vercel用の明示的なベースパス設定
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
    chunkSizeWarningLimit: 250, // 🥷 パフォーマンス忍者: より厳しい制限で最適化

    // 🚫 プリロード警告解決: 不要なプリロードを制御
    assetsInlineLimit: 4096, // 4KB以下のアセットをインライン化

    rollupOptions: {
      // 🥷 パフォーマンス忍者: Tree shaking 最大強化
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        // より積極的なTree shaking
        tryCatchDeoptimization: false,
        correctVarValueBeforeDeclaration: false,
      },
      output: {
        manualChunks: {
          // Core React
          'react-core': ['react', 'react-dom'],

          // Routing
          'react-router': ['react-router-dom'],

          // UI Libraries - shadcn-ui + Tailwind CSS統一
          'ui-core': ['lucide-react'],

          'radix-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
          ],
          'radix-components': [
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
          ],
          'radix-form': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-switch',
          ],
          'radix-utils': [
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-tooltip',
          ],

          // Charts (さらに細分化) - 🥷 パフォーマンス忍者: 遅延読み込み最適化
          'charts-core': ['chart.js'],
          'charts-react': ['react-chartjs-2'],
          'charts-recharts': ['recharts'],
          'charts-utils': ['chartjs-adapter-date-fns'],

          // Calendar (分割)
          'calendar-core': ['@fullcalendar/core', '@fullcalendar/react'],
          'calendar-views': ['@fullcalendar/daygrid', '@fullcalendar/timegrid'],
          'calendar-interaction': ['@fullcalendar/interaction'],

          // Utilities (さらに分割)
          'date-utils': ['date-fns'],
          'date-tz': ['date-fns-tz'],
          'moment-utils': ['moment'],
          'file-utils': ['uuid', 'file-saver'],
          'lodash-utils': ['lodash'],
          'http-utils': ['axios'],

          // State Management
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux'],

          // Firebase (分割)
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-db': ['firebase/firestore'],
          'firebase-storage': ['firebase/storage', 'firebase/analytics'],

          // Form Libraries
          'forms-core': ['react-hook-form'],
          'forms-validation': ['@hookform/resolvers', 'zod'],

          // Animation & Effects
          'toast-notifications': ['react-hot-toast'],
          animations: ['react-toastify'],

          // Development Tools
          'dev-tools': ['@anthropic-ai/sdk'],

          // 🚀 Performance: Split large components detected in build
          DailyTodoReminder: ['@/components/dailyToDoReminder/DailyTodoReminder'],
          WorkTimeComponents: [
            '@/components/WorkTimePunchSystem',
            '@/components/WorkTimeApprovalSystem',
            '@/components/WorkTimeHistoryManager',
          ],
          FeatureDiscovery: ['@/components/FeatureDiscoveryDashboard'],
          // 🧠 ADHD Core System: Main ADHD/ASD components bundle
          ADHDCoreSystem: [
            '@/components/ADHDSmartHome',
            '@/components/ADHDTaskManager',
            '@/components/ADHDLifeSyncDashboard',
            '@/components/ADHDLifeManagementHub',
            '@/components/ADHDIntegratedLifeSystem',
            '@/components/ADHDCognitiveAssessment',
          ],
        },
        // 🥷 パフォーマンス忍者: ファイル名とアセット最適化
        chunkFileNames: ({ name }) => {
          // 大きなチャンクにはhashを短縮
          return name.includes('index') ? 'js/[name]-[hash:8].js' : 'js/[name]-[hash].js';
        },
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'unknown';
          const info = name.split('.');
          const extType = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(name)) {
            return `media/[name]-[hash:8].${extType}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(name)) {
            return `img/[name]-[hash:8].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(name)) {
            return `fonts/[name]-[hash:8].${extType}`;
          }
          return `assets/[name]-[hash:8].${extType}`;
        },
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
    // 🥷 パフォーマンス忍者: 圧縮最適化
    reportCompressedSize: true,
  },
  // 🥷 パフォーマンス忍者: esbuild最適化設定
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        // 接続プール最適化
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            // Keep-Alive接続を有効にして接続の再利用を促進
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Keep-Alive', 'timeout=60, max=100');
          });
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          Connection: 'keep-alive',
        },
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
    // 🥷 パフォーマンス忍者: CSS最適化
    devSourcemap: false,
  },
  // ⚡ パフォーマンス最適化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hot-toast',
      'lodash',
      'lodash/get',
      'lodash/isObject',
      'lodash/isArray',
      'react-is', // React 19対応
      'prop-types', // ESMエクスポート問題を解決
      'tailwindcss-animate', // Tailwind CSS Animate問題を解決
      'eventemitter3', // EventEmitter3のESMエクスポート問題を解決
      'lucide-react', // アイコンライブラリ
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
