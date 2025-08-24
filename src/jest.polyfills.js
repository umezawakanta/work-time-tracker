/**
 * Jest polyfills for Node.js compatibility
 * Provides Web API polyfills required by MSW and other modern libraries
 */

// Check if we're in a Node.js environment and polyfill if needed
if (typeof global !== 'undefined' && !global.TransformStream) {
  try {
    const { TransformStream, ReadableStream, WritableStream } = require('node:stream/web');

    global.TransformStream = TransformStream;
    global.ReadableStream = ReadableStream;
    global.WritableStream = WritableStream;
  } catch (error) {
    // Fallback for older Node.js versions
    console.warn('Web Streams API not available, using fallback implementation');

    // Minimal fallback implementations
    global.TransformStream = class TransformStream {
      constructor() {
        this.readable = {};
        this.writable = {};
      }
    };

    global.ReadableStream = class ReadableStream {
      constructor() {}
    };

    global.WritableStream = class WritableStream {
      constructor() {}
    };
  }
}

// TextEncoder/TextDecoder polyfill for older environments
if (typeof global !== 'undefined' && !global.TextEncoder) {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Fetch polyfill if not available
if (typeof global !== 'undefined' && !global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  );
}
