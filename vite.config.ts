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
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24時間
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
                },
              },
            },
            {
              urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
                },
              },
            },
          ],
        },
        manifest: {
          name: 'ADHD/ASD LifeSync - 認知最適化生産性プラットフォーム',
          short_name: 'LifeSync',
          description: 'ADHD/ASD特性に最適化された統合生活管理システム',
          theme_color: '#3B82F6',
          background_color: '#FFFFFF',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
          categories: ['productivity', 'lifestyle', 'health'],
          screenshots: [
            {
              src: '/screenshots/dashboard-wide.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
            },
            {
              src: '/screenshots/dashboard-narrow.png',
              sizes: '375x667',
              type: 'image/png',
              form_factor: 'narrow',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
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

    // 開発サーバー設定
    server: {
      port: 3000,
      host: true,
      cors: true,
      headers: {
        // セキュリティヘッダー
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        // キャッシュヘッダー（開発時）
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },

    // プレビューサーバー設定（本番相当）
    preview: {
      port: 4173,
      host: true,
      cors: true,
      headers: {
        // 本番環境用セキュリティヘッダー
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',

        // パフォーマンス・キャッシュヘッダー
        'Cache-Control': 'public, max-age=31536000, immutable',
        ETag: 'strong',
      },
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
      },
    },

    // 環境変数
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __COMMIT_HASH__: JSON.stringify(process.env.VITE_COMMIT_HASH || 'unknown'),
    },

    // 最適化設定
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'lodash',
        'lodash/get',
        'lodash/set',
        'lodash/isEmpty',
        'lodash/isEqual',
        '@radix-ui/react-accordion',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-avatar',
        '@radix-ui/react-button',
        '@radix-ui/react-card',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-label',
        '@radix-ui/react-progress',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-textarea',
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
