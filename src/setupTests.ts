import "@testing-library/jest-dom";

// Vite環境変数のモック
const mockImport = {
  env: {
    VITE_API_BASE_URL: "http://localhost:3000/api",
    VITE_USE_MOCK_DATA: "true",
    MODE: "test",
    DEV: true,
    PROD: false,
    SSR: false,
  },
};

Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: mockImport.env,
    },
  },
});

// Jestのグローバル関数をモック
type MockFunction = jest.MockInstance<unknown, unknown[]>;

const createMockFunction = (): MockFunction => {
  const mockFn = jest.fn() as MockFunction;
  mockFn.mockImplementation = <T extends (...args: unknown[]) => unknown>(
    fn: T
  ): MockFunction => {
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
