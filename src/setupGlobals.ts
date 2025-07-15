import React from 'react';

// Make React available globally for all tests
// This must run before any other setup to ensure React is available
(global as any).React = React;

// Also add to window for browser-like access
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

console.log('🔧 React globals setup completed');
