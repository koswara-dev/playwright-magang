// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const isHeadless = process.env.HEADLESS !== 'false';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid conflicting state during user registration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          Framework: 'Playwright',
          Browser: 'Google Chrome',
          Node: process.version,
          Platform: process.platform,
          Environment: 'Staging / Magang Hadir'
        }
      }
    ]
  ],
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: process.env.BASE_URL || 'https://magang.dikahadir.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 }
  },
  projects: [
    // Setup project for Global Authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: isHeadless
      }
    },
    // Main testing project running on Google Chrome default headless
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: isHeadless,
        storageState: 'playwright/.auth/admin.json',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
      },
      dependencies: ['setup']
    }
  ]
});
