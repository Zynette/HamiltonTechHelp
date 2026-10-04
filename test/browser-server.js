// Test-only transport. No network requests or real customer messages.
import { createApp } from '../src/server.js';
createApp({
  formId: 'test1234',
  limit: 100,
  deliver: async (data) => {
    if (data.email === 'failure@example.com') return false;
    return true;
  },
}).listen(3101, '127.0.0.1');
