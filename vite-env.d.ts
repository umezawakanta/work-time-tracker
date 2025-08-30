/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 他のカスタム環境変数をここに追加できます
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// CSS Modules declarations
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Jest/Testing globals (only for type safety in files not excluded by Vercel ts builds)
declare const jest: any;
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function expect(actual: any): any;
