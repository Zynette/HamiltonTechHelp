import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './test/browser',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3101',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
          args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-webgl', '--no-zygote'],
        }
      : {},
  },
  webServer: {
    command: 'node test/browser-server.js',
    url: 'http://localhost:3101/healthz',
    reuseExistingServer: false,
  },
});
