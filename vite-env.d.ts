/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 他のカスタム環境変数をここに追加できます
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
