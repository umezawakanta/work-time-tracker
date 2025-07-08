// Mock for static assets (images, fonts, media files, etc.)
// This prevents Jest from trying to process these files

module.exports = {
  // Return a string that represents the file path for testing
  src: '/mock-file-path',

  // For named exports
  default: '/mock-file-path',

  // Additional properties that might be accessed
  toString: () => '/mock-file-path',

  // For URL objects
  href: '/mock-file-path',

  // For any other property access
  [Symbol.toPrimitive]: () => '/mock-file-path',
};
