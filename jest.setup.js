import '@testing-library/jest-dom';

// Polyfill browser APIs that MSW expects
if (typeof global.TransformStream === 'undefined') {
  const { TransformStream } = require('web-streams-polyfill');
  global.TransformStream = TransformStream;
}

if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class {
    constructor() { }
    postMessage() { }
    close() { }
    addEventListener() { }
    removeEventListener() { }
  };
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
