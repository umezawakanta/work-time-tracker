/**
 * Vite Environment Mock for Testing
 * This file provides mocks for Vite-specific features that aren't available in Jest
 */

// Mock import.meta.env
export const importMeta = {
  env: {
    DEV: false,
    PROD: true,
    MODE: 'test',
    VITE_API_URL: 'http://localhost:3000',
    VITE_FIREBASE_API_KEY: 'test-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    VITE_FIREBASE_APP_ID: 'test-app-id',
  },
};

// Set up global import.meta mock
if (typeof global !== 'undefined') {
  // Casting to any to attach a testing-only shim
  (global as any).import = {
    meta: importMeta,
  };
}

// Also provide as named export for direct imports
export const env = importMeta.env;
