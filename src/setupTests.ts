import '@testing-library/jest-dom';

// Vite環境変数のモック
const mockImport = {
  env: {
    VITE_API_BASE_URL: 'http://localhost:3001/api',
    VITE_USE_MOCK_DATA: 'true',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false,
  },
};

// import.meta.envのモック
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: mockImport.env,
    },
  },
  writable: true,
  configurable: true,
});

// ES module環境でのJest設定
declare global {
  var jest: typeof import('@jest/globals').jest;
}

// Jestのグローバル関数をモック
type MockFunction = jest.MockInstance<unknown, unknown[]>;

const createMockFunction = (): MockFunction => {
  const mockFn = jest.fn() as MockFunction;
  mockFn.mockImplementation = <T extends (...args: unknown[]) => unknown>(fn: T): MockFunction => {
    return mockFn.mockImplementation(fn);
  };
  return mockFn;
};

interface GlobalWithJest {
  jest: {
    fn: () => MockFunction;
  };
}

(global as unknown as GlobalWithJest).jest = {
  fn: createMockFunction,
};
