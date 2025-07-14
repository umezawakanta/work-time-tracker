// Mock TokenManager for Jest tests
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
  getDebugInfo: jest.fn(() => ({
    hasAccessToken: false,
    hasRefreshToken: false,
    accessTokenExpiry: new Date().toISOString(),
    refreshTokenExpiry: new Date().toISOString(),
    isRefreshing: false,
    timeUntilRefresh: 0,
  })),
  setRememberMe: jest.fn(() => Promise.resolve()),
};

// Export the mock
module.exports = {
  TokenManager: {
    getInstance: jest.fn(() => {
      console.log('🔧 MockTokenManager.getInstance() called, returning mockTokenManager');
      return mockTokenManager;
    }),
  },
  tokenManager: mockTokenManager,
}; 