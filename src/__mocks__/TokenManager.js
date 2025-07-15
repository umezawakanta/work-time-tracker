// Manual mock for TokenManager - this file is used by Jest's moduleNameMapper
const mockTokenManager = {
  isAuthenticated: jest.fn(() => {
    console.log('🔧 MockTokenManager.isAuthenticated() called, returning false');
    return false;
  }),
  getAccessToken: jest.fn(() => {
    console.log('🔧 MockTokenManager.getAccessToken() called, returning null');
    return Promise.resolve(null);
  }),
  getRefreshToken: jest.fn(() => {
    console.log('🔧 MockTokenManager.getRefreshToken() called, returning null');
    return null;
  }),
  setTokens: jest.fn(() => Promise.resolve()),
  clearTokens: jest.fn(() => Promise.resolve()),
  getSessionInfo: jest.fn(() => {
    const sessionInfo = {
      isAuthenticated: false,
      expiresAt: null,
      refreshExpiresAt: null,
      timeUntilExpiry: 0,
      timeUntilRefreshExpiry: 0,
    };
    console.log('🔧 MockTokenManager.getSessionInfo() called, returning:', sessionInfo);
    return sessionInfo;
  }),
  getDebugInfo: jest.fn(() => {
    const debugInfo = {
      hasAccessToken: false,
      hasRefreshToken: false,
      accessTokenExpiry: new Date().toISOString(),
      refreshTokenExpiry: new Date().toISOString(),
      isRefreshing: false,
      timeUntilRefresh: 0,
    };
    console.log('🔧 MockTokenManager.getDebugInfo() called, returning:', debugInfo);
    return debugInfo;
  }),
  setRememberMe: jest.fn(() => Promise.resolve()),
};

// Make sure to reset all mocks to unauthenticated state before each test
const resetToUnauthenticatedState = () => {
  mockTokenManager.isAuthenticated.mockReturnValue(false);
  mockTokenManager.getAccessToken.mockResolvedValue(null);
  mockTokenManager.getRefreshToken.mockReturnValue(null);
  mockTokenManager.getSessionInfo.mockReturnValue({
    isAuthenticated: false,
    expiresAt: null,
    refreshExpiresAt: null,
    timeUntilExpiry: 0,
    timeUntilRefreshExpiry: 0,
  });
  mockTokenManager.getDebugInfo.mockReturnValue({
    hasAccessToken: false,
    hasRefreshToken: false,
    accessTokenExpiry: new Date().toISOString(),
    refreshTokenExpiry: new Date().toISOString(),
    isRefreshing: false,
    timeUntilRefresh: 0,
  });
  console.log('🔧 TokenManager mock reset to unauthenticated state');
};

// Reset to unauthenticated state initially
resetToUnauthenticatedState();

// Export both the singleton instance pattern and the class
module.exports = {
  TokenManager: {
    getInstance: jest.fn(() => {
      console.log('🔧 TokenManager.getInstance() called, returning mockTokenManager');
      return mockTokenManager;
    }),
  },
  tokenManager: mockTokenManager,
  __mockTokenManager: mockTokenManager, // For direct access in tests
  __resetToUnauthenticatedState: resetToUnauthenticatedState, // For test utilities
}; 