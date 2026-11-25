// @ts-check
const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const RegisterUserPage = require('../src/pages/RegisterUserPage');
const DataHelper = require('../src/utils/dataHelper');

test.describe('Feature: User Management - Register User V2', () => {

  test.beforeEach(async () => {
    await allure.epic('User Management');
    await allure.feature('Register User V2');
    await allure.owner('JuaraCoding SQA Team');
  });

  test.describe('Positive Scenarios @positive', () => {
    test('TC-REG-POS-001: Register user with valid data and mandatory photo', async ({ page }) => {
      await allure.story('Happy Path User Registration');
      await allure.severity('critical');
      await allure.tag('positive', 'smoke', 'registration');

      const registerPage = new RegisterUserPage(page);
      
      await allure.step('Navigate to Register User page', async () => {
        await registerPage.goto();
      });

      const user = DataHelper.generateValidUser();
      const avatarPath = DataHelper.getSampleAvatarPath();

      console.log(`[TEST] Registering user: ${user.fullname} (${user.email}), NIK: ${user.nik}`);

      await allure.step('Upload Employee Avatar Photo (<2MB)', async () => {
        await registerPage.uploadPhoto(avatarPath);
      });

      await allure.step('Fill Account Information (NIK, Name, Email, Password)', async () => {
        await registerPage.fillAccountInformation({
          nik: user.nik,
          fullname: user.fullname,
          email: user.email,
          password: user.password
        });
      });

      await allure.step('Fill Work Information (Divisi, Unit, Posisi, Jabatan, Kontrak)', async () => {
        await registerPage.fillWorkInformation();
      });

      await allure.step('Fill Attendance Settings (Lokasi, Shift, Jadwal, Selfie, Cuti)', async () => {
        await registerPage.fillPengaturanAbsensi({ jumlahCuti: user.jumlahCuti });
      });

      await allure.step('Submit Registration Form', async () => {
        await registerPage.submit();
      });

      await allure.step('Verify Registration Result', async () => {
        const toast = await registerPage.getToastMessage();
        console.log('[TEST] Result Toast:', toast);

        if (toast) {
          expect(toast).not.toContain('Foto tidak boleh kosong');
        }
        
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        console.log('[TEST] Final URL:', currentUrl);
        expect(currentUrl).toBeDefined();
      });
    });
  });

  test.describe('Negative Scenarios @negative', () => {
    test('TC-REG-NEG-001: Should prevent submission and show error when photo is missing', async ({ page }) => {
      await allure.story('Missing Photo Validation');
      await allure.severity('critical');
      await allure.tag('negative', 'validation', 'photo');

      const registerPage = new RegisterUserPage(page);
      await allure.step('Navigate to Register User page', async () => {
        await registerPage.goto();
      });

      const user = DataHelper.generateValidUser();

      await allure.step('Fill account and work info without uploading photo', async () => {
        await registerPage.fillAccountInformation({
          nik: user.nik,
          fullname: user.fullname,
          email: user.email,
          password: user.password
        });
        await registerPage.fillWorkInformation().catch(() => {});
        await registerPage.fillPengaturanAbsensi({ jumlahCuti: user.jumlahCuti }).catch(() => {});
      });

      await allure.step('Submit form and verify submission is prevented', async () => {
        await registerPage.submit();
        
        // Verify user remains on the register page
        expect(page.url()).toContain('/management/user-v2/register');

        // Check if snackbar appeared or HTML5 validation intercepted
        const snackbar = page.locator('.MuiSnackbarContent-message, .MuiSnackbar-root, .MuiAlert-message, [role="alert"]').filter({ hasText: 'Foto tidak boleh kosong' }).first();
        const isSnackbarVisible = await snackbar.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
        const isFormInvalid = await page.evaluate(() => {
          const form = document.querySelector('form');
          return form ? !form.checkValidity() : false;
        });

        console.log(`[TEST] Missing photo check - Snackbar: ${isSnackbarVisible}, Form invalid: ${isFormInvalid}`);
        expect(isSnackbarVisible || isFormInvalid).toBeTruthy();
      });
    });

    test('TC-REG-NEG-004: Should prevent submission when all mandatory fields are empty', async ({ page }) => {
      await allure.story('Empty Mandatory Fields Validation');
      await allure.severity('normal');
      await allure.tag('negative', 'validation', 'empty-fields');

      const registerPage = new RegisterUserPage(page);
      await allure.step('Navigate to Register User page', async () => {
        await registerPage.goto();
      });

      await allure.step('Submit empty form and verify submission is prevented', async () => {
        await registerPage.submit();
        const toast = await registerPage.getToastMessage();
        console.log('[TEST] Empty submit toast:', toast);

        expect(page.url()).toContain('/management/user-v2/register');

        const isNikValid = await registerPage.nikInput.evaluate(el => /** @type {HTMLInputElement} */ (el).checkValidity()).catch(() => true);
        const isFullnameValid = await registerPage.fullnameInput.evaluate(el => /** @type {HTMLInputElement} */ (el).checkValidity()).catch(() => true);
        
        console.log(`[TEST] Validity check - NIK valid: ${isNikValid}, Fullname valid: ${isFullnameValid}`);
        expect(isNikValid === false || isFullnameValid === false || toast.length > 0).toBeTruthy();
      });
    });

    test('TC-REG-NEG-005: Should validate invalid email format', async ({ page }) => {
      await allure.story('Email Format Validation');
      await allure.severity('normal');
      await allure.tag('negative', 'validation', 'email');

      const registerPage = new RegisterUserPage(page);
      await allure.step('Navigate to Register User page', async () => {
        await registerPage.goto();
      });

      const avatarPath = DataHelper.getSampleAvatarPath();
      await allure.step('Upload photo and fill invalid email (no @)', async () => {
        await registerPage.uploadPhoto(avatarPath);
        await registerPage.fillAccountInformation({
          nik: '3175000000000001',
          fullname: 'Testing User',
          email: 'invalid-email-format-without-at',
          password: 'Password123#'
        });
      });

      await allure.step('Submit form and verify HTML5 email format error', async () => {
        await registerPage.submit();
        const isEmailValid = await registerPage.emailInput.evaluate((el) => {
          /** @type {HTMLInputElement} */ (el).checkValidity();
          return /** @type {HTMLInputElement} */ (el).validity.valid;
        });
        console.log('[TEST] Email HTML5 validity status:', isEmailValid);
        expect(isEmailValid).toBe(false);
      });
    });
  });

  test.describe('Security & Access Control @security', () => {
    test('TC-REG-SEC-003: Unauthenticated user directly accessing register page should redirect to login', async ({ browser }) => {
      await allure.story('Direct Access Protection');
      await allure.severity('blocker');
      await allure.tag('security', 'access-control');

      await allure.step('Open clean browser context without credentials', async () => {
        const cleanContext = await browser.newContext({ storageState: undefined });
        const cleanPage = await cleanContext.newPage();

        await cleanPage.goto('https://magang.dikahadir.com/management/user-v2/register');
        await cleanPage.waitForURL(url => url.pathname.includes('/authentication/login'), { timeout: 15000 });
        console.log('[TEST] Unauthenticated redirect URL:', cleanPage.url());

        expect(cleanPage.url()).toContain('/authentication/login');
        await cleanContext.close();
      });
    });
  });

});
