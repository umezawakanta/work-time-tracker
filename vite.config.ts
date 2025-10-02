import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => {
  // 環境変数を読み込み
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        // JSXランタイムを自動検出
        jsxRuntime: 'automatic',
      }),
    ],
    
    // 環境変数の定義
    define: {
      'process.env.REACT_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION || '1.4.0'),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    
    // パスエイリアスの設定
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@types': resolve(__dirname, 'src/types'),
        '@hooks': resolve(__dirname, 'src/hooks'),
      },
    },
    
    // 開発サーバー設定
    server: {
      port: 9000,
      host: true, // 外部からのアクセスを許可
      open: true, // 自動でブラウザを開く
      cors: true, // CORSを有効化
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://work-time-tracker-five.vercel.app',
          changeOrigin: true,
          secure: true,
          // プロキシエラーハンドリング
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('プロキシエラー:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('APIリクエスト:', req.method, req.url);
            });
          },
        },
      },
    },
    
    // ビルド設定
    build: {
      outDir: "dist",
      sourcemap: mode === 'development', // 開発時のみソースマップを生成
      minify: 'terser', // より効率的な圧縮
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // 本番環境でconsole.logを削除
          drop_debugger: true,
        },
      },
      // チャンクサイズの最適化
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@mui/material', '@mui/icons-material'],
          },
        },
      },
      // アセットサイズの警告閾値を設定
      chunkSizeWarningLimit: 1000,
    },
    
    // プレビューサーバー設定
    preview: {
      port: 9001,
      host: true,
    },
    
    // CSS設定
    css: {
      devSourcemap: true, // CSSソースマップを有効化
    },
    
    // 最適化設定
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@vite/client', '@vite/env'],
    },
    
    // ログレベル設定
    logLevel: mode === 'development' ? 'info' : 'warn',
  };
});