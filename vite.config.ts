import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),

      // PWA機能強化 - オフライン対応・プッシュ通知・背景同期
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'ADHD統合ライフハブ - Work Time Tracker',
          short_name: 'ADHDライフハブ',
          description: 'ADHD/ASD特化型生活支援システム - 時間管理・財務管理・認知支援を統合',
          theme_color: '#667eea',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB limit
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            // External API calls (避免与内部API冲突)
            {
              urlPattern: /^https:\/\/external-api\./,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'external-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 12, // 12時間
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                networkTimeoutSeconds: 10,
              },
            },
            // 内部API用の設定 (統一設定で競合を避ける)
            {
              urlPattern: ({ url }) => {
                return url.pathname.startsWith('/api/') && url.origin === self.location.origin;
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'internal-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 10, // 10分 (短めで最新データを確保)
                },
                cacheableResponse: {
                  statuses: [200],
                },
                networkTimeoutSeconds: 8,
                // Response clone エラーを回避するためのプラグイン
                plugins: [
                  {
                    cacheKeyWillBeUsed: async ({ request }) => {
                      return `${request.url}?t=${Math.floor(Date.now() / (1000 * 60 * 5))}`; // 5分毎にキャッシュ更新
                    },
                    requestWillFetch: async ({ request }) => {
                      // リクエストを新しいインスタンスとして複製
                      return new Request(request);
                    },
                    fetchDidSucceed: async ({ response }) => {
                      // レスポンスをクローンする前に確認
                      if (response.bodyUsed) {
                        return response;
                      }
                      return response.clone();
                    },
                  },
                ],
              },
            },
            // 画像キャッシュ
            {
              urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
                },
              },
            },
            // フォントキャッシュ
            {
              urlPattern: /^https:\/\/.*\.(?:woff|woff2|eot|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
                },
              },
            },
            // 静的リソースキャッシュ
            {
              urlPattern: /^https:\/\/.*\.(?:js|css)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-resources-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 1週間
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // 開発環境でService Workerを完全無効化
          type: 'module',
          navigateFallback: 'index.html',
        },
        // 開発環境では登録しない
        disable: mode === 'development',
      }),

      // Bundle解析ツール
      ...(mode === 'analyze'
        ? [
            visualizer({
              filename: 'dist/bundle-analysis.html',
              open: true,
              gzipSize: true,
              brotliSize: true,
            }) as any,
          ]
        : []),
    ],

    // Development server settings to fix WebSocket issues
    server: {
      port: 3000,
      host: 'localhost',
      hmr: {
        port: 3001,
        host: 'localhost',
      },
      watch: {
        usePolling: false,
        interval: 100,
      },
      fs: {
        strict: false,
      },
    },

    // Preview server settings
    preview: {
      port: 3000,
      host: 'localhost',
    },

    // CDN統合のためのビルド設定
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
        },
        mangle: {
          safari10: true,
        },
      },
      rollupOptions: {
        output: {
          // ファイルハッシュ化でキャッシュ最適化
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name!.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name].[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name].[hash][extname]`;
            }
            return `assets/[name].[hash][extname]`;
          },

          // Code splittingの最適化
          manualChunks: (id) => {
            // Vendor chunksの分離
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('lucide-react') || id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              if (id.includes('recharts') || id.includes('chart.js')) {
                return 'chart-vendor';
              }
              if (id.includes('date-fns') || id.includes('react-big-calendar')) {
                return 'date-vendor';
              }
              if (id.includes('mongoose') || id.includes('socket.io')) {
                return 'data-vendor';
              }
              return 'vendor';
            }

            // 機能別chunksの分離
            if (id.includes('/cognitive/')) {
              return 'cognitive-features';
            }
            if (id.includes('/worktime/')) {
              return 'worktime-features';
            }
            if (id.includes('/chart/') || id.includes('/analytics/')) {
              return 'analytics-features';
            }
            if (id.includes('/testing/') || id.includes('/performance/')) {
              return 'testing-features';
            }
          },
        },

        // 外部依存関係の最適化
        external: mode === 'production' ? [] : undefined,
      },

      // チャンク分割の最適化
      chunkSizeWarningLimit: 1000,

      // 静的アセット処理
      assetsDir: 'assets',
      assetsInlineLimit: 4096, // 4KB以下はインライン化

      // ソースマップの設定
      sourcemap: mode === 'development' ? true : 'hidden',

      // 圧縮設定
      cssCodeSplit: true,
      cssMinify: true,
    },

    // エイリアス設定
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@styles': path.resolve(__dirname, './src/styles'),
        // Lodash ESM compatibility
        lodash: 'lodash',
        // React 19 compatibility - force specific versions
        'react-is': 'react-is',
        'prop-types': 'prop-types',
      },
    },

    // 環境変数
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __COMMIT_HASH__: JSON.stringify(process.env.VITE_COMMIT_HASH || 'unknown'),
      // React 19 compatibility
      'process.env': {},
      global: 'globalThis',
    },

    // 最適化設定
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-is',
        'prop-types',
        'lucide-react',
        'lodash',
        'lodash/get',
        'lodash/set',
        'lodash/isEmpty',
        'lodash/isEqual',
        '@radix-ui/react-accordion',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-avatar',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-label',
        '@radix-ui/react-progress',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
        '@radix-ui/react-tooltip',
      ],
      exclude: [
        // 大きなライブラリで動的インポートが必要なもの
        'recharts',
        'chart.js',
        'mongoose',
      ],
    },

    // CSS設定
    css: {
      devSourcemap: mode === 'development',
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },

    // テスト設定
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/setupTests.ts',
          'src/test/',
          '**/*.d.ts',
          '**/*.test.*',
          '**/*.spec.*',
        ],
      },
    },
  };
});
