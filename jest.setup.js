// Jest環境用のimport.metaポリフィル
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3001/api',
      VITE_USE_MOCK_DATA: 'true',
      MODE: 'test',
      DEV: true,
      PROD: false,
      SSR: false,
    },
  },
};

// Ensure import.meta is defined before any module imports
globalThis.import = global.import;