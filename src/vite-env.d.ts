/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN: string
  // 他の環境変数もここに追加可能
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
