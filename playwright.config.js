import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: [
    {
      command: 'node server/index.js',
      port: 3000,
      reuseExistingServer: true,
    },
    {
      command: 'npm run client',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});
