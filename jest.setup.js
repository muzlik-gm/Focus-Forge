import "@testing-library/jest-dom";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Fallback to .env.local if .env.test doesn't exist
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

// Polyfill fetch for Node.js test environment
if (!global.fetch) {
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
  global.Headers = nodeFetch.Headers;
  global.Request = nodeFetch.Request;
  global.Response = nodeFetch.Response;
}

// Polyfill TextEncoder/TextDecoder for jose library
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill PointerEvent for Framer Motion (only in jsdom environment)
if (typeof global.PointerEvent === 'undefined' && typeof global.MouseEvent !== 'undefined') {
  class PointerEvent extends MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.width = params.width || 0;
      this.height = params.height || 0;
      this.pressure = params.pressure || 0;
      this.tangentialPressure = params.tangentialPressure || 0;
      this.tiltX = params.tiltX || 0;
      this.tiltY = params.tiltY || 0;
      this.twist = params.twist || 0;
      this.pointerType = params.pointerType || '';
      this.isPrimary = params.isPrimary || false;
    }
  }
  global.PointerEvent = PointerEvent;
}

// Clear rate limits before each test
beforeEach(() => {
  // Dynamically import and clear rate limits
  try {
    const { clearAllRateLimits } = require('./lib/rate-limit');
    clearAllRateLimits();
  } catch (error) {
    // Ignore if rate-limit module is not available
  }
});
