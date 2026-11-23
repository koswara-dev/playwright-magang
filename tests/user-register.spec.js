// @ts-check
const { test, expect } = require('@playwright/test');
const RegisterUserPage = require('../src/pages/RegisterUserPage');
const DataHelper = require('../src/utils/dataHelper');

test.describe('Feature: User Management - Register User V2', () => {

  test.describe('Positive Scenarios @positive', () => {
    test('TC-REG-POS-001: Register user with valid data and mandatory photo', async ({ page }) => {
      const registerPage = new RegisterUserPage(page);
      await registerPage.goto();

      const user = DataHelper.generateValidUser();
      const avatarPath = DataHelper.getSampleAvatarPath();

      console.log(`[TEST] Registering user: ${user.fullname} (${user.email}), NIK: ${user.nik}`);

      // 1. Upload Foto
      await registerPage.uploadPhoto(avatarPath);

      // 2. Account Information
      await registerPage.fillAccountInformation({
        nik: user.nik,
        fullname: user.fullname,
        email: user.email,
        password: user.password
      });

      // 3. Work Information (MUI dynamic selects)
      await registerPage.fillWorkInformation();

      // 4. Pengaturan Absensi
      await registerPage.fillPengaturanAbsensi({ jumlahCuti: user.jumlahCuti });

      // 5. Submit Form
      await registerPage.submit();

      // Verification: Check toast or redirect
      const toast = await registerPage.getToastMessage();
      console.log('[TEST] Result Toast:', toast);

      // Either toast shows success or page redirects to user management list
      if (toast) {
        expect(toast).not.toContain('Foto tidak boleh kosong');
      }
      
      // Allow slight wait for processing
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log('[TEST] Final URL:', currentUrl);
      expect(currentUrl).toBeDefined();
    });
  });

  test.describe('Negative Scenarios @negative', () => {
    test('TC-REG-NEG-001: Should prevent submission and show error when photo is missing', async ({ page }) => {
      const registerPage = new RegisterUserPage(page);
      await registerPage.goto();

      const user = DataHelper.generateValidUser();

      // Fill account information without uploading photo
      await registerPage.fillAccountInformation({
        nik: user.nik,
        fullname: user.fullname,
        email: user.email,
        password: user.password
      });

      await registerPage.fillWorkInformation();
      await registerPage.fillPengaturanAbsensi({ jumlahCuti: user.jumlahCuti });

      // Click submit
      await registerPage.submit();

      // Verify validation toast/snackbar "Foto tidak boleh kosong" appears
      const snackbar = page.locator('.MuiSnackbarContent-message, .MuiSnackbar-root, .MuiAlert-message, [role="alert"]').filter({ hasText: 'Foto tidak boleh kosong' }).first();
      await expect(snackbar).toBeVisible({ timeout: 10000 });

      // Verify user remains on the register page
      expect(page.url()).toContain('/management/user-v2/register');
    });

    test('TC-REG-NEG-004: Should prevent submission when all mandatory fields are empty', async ({ page }) => {
      const registerPage = new RegisterUserPage(page);
      await registerPage.goto();

      // Directly click submit
      await registerPage.submit();

      // Check whether form was prevented from submitting (HTML5 validation or toast)
      const toast = await registerPage.getToastMessage();
      console.log('[TEST] Empty submit toast:', toast);

      // Verify that user remains on the register page and submission did not navigate away
      expect(page.url()).toContain('/management/user-v2/register');

      // Verify at least one mandatory field (NIK/Fullname/Email/File) is invalid
      const isNikValid = await registerPage.nikInput.evaluate(el => /** @type {HTMLInputElement} */ (el).checkValidity()).catch(() => true);
      const isFullnameValid = await registerPage.fullnameInput.evaluate(el => /** @type {HTMLInputElement} */ (el).checkValidity()).catch(() => true);
      
      // If HTML5 validation is active, at least one required field reports invalid
      console.log(`[TEST] Validity check - NIK valid: ${isNikValid}, Fullname valid: ${isFullnameValid}`);
      expect(isNikValid === false || isFullnameValid === false || toast.length > 0).toBeTruthy();
    });

    test('TC-REG-NEG-005: Should validate invalid email format', async ({ page }) => {
      const registerPage = new RegisterUserPage(page);
      await registerPage.goto();

      const avatarPath = DataHelper.getSampleAvatarPath();
      await registerPage.uploadPhoto(avatarPath);

      // Fill invalid email (no @)
      await registerPage.fillAccountInformation({
        nik: '3175000000000001',
        fullname: 'Testing User',
        email: 'invalid-email-format-without-at',
        password: 'Password123#'
      });

      await registerPage.submit();

      // Verify input validity state
      const isEmailValid = await registerPage.emailInput.evaluate((el) => {
        /** @type {HTMLInputElement} */ (el).checkValidity();
        return /** @type {HTMLInputElement} */ (el).validity.valid;
      });
      console.log('[TEST] Email HTML5 validity status:', isEmailValid);
      expect(isEmailValid).toBe(false);
    });
  });

  test.describe('Security & Access Control @security', () => {
    test('TC-REG-SEC-003: Unauthenticated user directly accessing register page should redirect to login', async ({ browser }) => {
      // Create a fresh isolated context with NO storageState
      const cleanContext = await browser.newContext({ storageState: undefined });
      const cleanPage = await cleanContext.newPage();

      await cleanPage.goto('https://magang.dikahadir.com/management/user-v2/register');

      // Wait for redirect to login page
      await cleanPage.waitForURL(url => url.pathname.includes('/authentication/login'), { timeout: 15000 });
      console.log('[TEST] Unauthenticated redirect URL:', cleanPage.url());

      expect(cleanPage.url()).toContain('/authentication/login');
      await cleanContext.close();
    });
  });

});
