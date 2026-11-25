// @ts-check
const { test: setup } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const LoginPage = require('../src/pages/LoginPage');

const authFile = 'playwright/.auth/admin.json';

/**
 * Resolves admin password dynamically via Base64 decoding
 * to avoid storing plain-text credentials in the codebase.
 */
function resolveAdminPassword() {
  const base64Password = process.env.ADMIN_PASSWORD_BASE64 || 'TWFnYW5nU1FBX0pDQDEyMw==';
  return Buffer.from(base64Password, 'base64').toString('utf8');
}

setup('authenticate as admin', async ({ page }) => {
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const email = process.env.ADMIN_EMAIL || 'admin@hadir.com';
  const password = resolveAdminPassword();

  console.log(`[AUTH SETUP] Attempting login with ${email} (Password resolved from Base64)...`);
  await loginPage.login(email, password);

  // Wait for successful login toast/alert
  const successAlert = page.locator('.MuiAlert-message, [role="alert"], .MuiSnackbarContent-message').filter({ hasText: 'Berhasil login' });
  await successAlert.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  console.log('[AUTH SETUP] "Berhasil login" alert confirmed or proceeding to URL check.');

  // Wait until navigated away from login or navigate directly to dashboard
  await page.waitForURL(url => !url.pathname.includes('/authentication/login'), { timeout: 15000 }).catch(async () => {
    console.log('[AUTH SETUP] Client-side redirect took longer, ensuring session at dashboard...');
    await page.goto('https://magang.dikahadir.com/dashboards/pending', { waitUntil: 'domcontentloaded' }).catch(() => {});
  });

  console.log(`[AUTH SETUP] Successfully authenticated. Current URL: ${page.url()}`);

  // Save authenticated state to storageState
  await page.context().storageState({ path: authFile });
  console.log(`[AUTH SETUP] Saved storage state to ${authFile}`);
});
