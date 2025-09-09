// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
      // Build-time guard to ensure a single React runtime is bundled (disabled on Vercel)
      ...(env.VITE_ENABLE_REACT_GUARD === 'true'
        ? [
            {
              name: 'single-react-guard',
              apply: 'build',
              generateBundle(_options, bundle) {
                try {
                  const reactRoots = new Set<string>();
                  const reactDomRoots = new Set<string>();
                  for (const chunk of Object.values(bundle)) {
                    if ((chunk as any).type !== 'chunk') continue;
                    const modules = (chunk as any).modules || {};
                    for (const id of Object.keys(modules)) {
                      const norm = id.replace(/\\/g, '/');
                      const m = norm.match(/(.*?node_modules\/(react|react-dom))(\/|$)/);
                      if (m) {
                        const root = m[1];
                        if (m[2] === 'react') reactRoots.add(root);
                        if (m[2] === 'react-dom') reactDomRoots.add(root);
                      }
                    }
                  }
                  if (reactRoots.size > 1 || reactDomRoots.size > 1) {
                    const msg = `Detected multiple React runtimes in bundle. react: ${
                      [...reactRoots].join(', ') || 'n/a'
                    } | react-dom: ${[...reactDomRoots].join(', ') || 'n/a'}`;
                    this.warn(`[single-react-guard] ${msg}`);
                  }
                } catch (e) {
                  this.warn(`[single-react-guard] check failed: ${String(e)}`);
                }
              },
            },
          ]
        : []),

      // PWA機能強化 - オフライン対応・プッシュ通知・背景同期 (本番環境のみ)
      ...(mode === 'production' && env.VITE_ENABLE_PWA === 'true'
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              // 完全に登録を抑止（main.tsで明示的にunregisterしているため）
              injectRegister: null,
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
                cleanupOutdatedCaches: true,
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
                      return (
                        url.pathname.startsWith('/api/') && url.origin === self.location.origin
                      );
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
                  // CSSのみを軽くキャッシュ（JSはキャッシュしない: バンドル不整合回避）
                  {
                    urlPattern: ({ request }) => request.destination === 'style',
                    handler: 'StaleWhileRevalidate',
                    options: {
                      cacheName: 'styles-cache',
                      expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 60 * 60 * 24 * 7, // 1週間
                      },
                    },
                  },
                ],
              },
              devOptions: {
                enabled: false,
              },
            }),
          ]
        : []),

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

    // Development server settings
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      // Let Vite use the same port for HMR as the dev server to avoid blocked 3002
      hmr: {
        port: 3000,
        host: 'localhost',
      },
      // Forward local API calls to the Express backend in development
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
          ws: true,
          // No path rewrite needed because backend is mounted at /api/*
        },
      },
      watch: {
        usePolling: false,
        interval: 100,
      },
      fs: {
        strict: false,
        allow: ['..'],
      },
      cors: true,
      open: false,
    },

    // Preview server settings
    preview: {
      port: 4173,
      host: '0.0.0.0',
      strictPort: true,
      cors: true,
    },

    // CDN統合のためのビルド設定
    build: {
      target: 'esnext',
      minify: 'esbuild',
      reportCompressedSize: false,
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
        },
      },

      // チャンク分割の最適化
      chunkSizeWarningLimit: 2000,

      // 静的アセット処理
      assetsDir: 'assets',
      assetsInlineLimit: 4096, // 4KB以下はインライン化

      // ソースマップの設定
      sourcemap: mode === 'development' ? true : false,

      // 圧縮設定
      cssCodeSplit: true,
      cssMinify: env.VITE_DISABLE_CSS_MINIFY === 'true' ? false : true,
    },

    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
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
        'react-is': 'react-is',
        'prop-types': 'prop-types',
      },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    },

    // 環境変数
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __COMMIT_HASH__: JSON.stringify(process.env.VITE_COMMIT_HASH || 'unknown'),
      // Ensure NODE_ENV is available without clobbering process.env object
      'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
      global: 'globalThis',
    },

    // 最適化設定
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom', 'lucide-react'],
      exclude: ['mongoose'],
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
