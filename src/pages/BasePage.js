class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForNetworkIdle(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {});
  }

  async getToastMessage(timeout = 8000) {
    // MUI Snackbar, alerts, Notistack, or custom toast notifications
    const toastLocator = this.page.locator('.MuiSnackbarContent-message, .MuiSnackbar-root, .MuiAlert-message, [role="alert"], .notistack-Snackbar, .Toastify__toast-body, .swal2-title');
    await toastLocator.first().waitFor({ state: 'visible', timeout }).catch(() => {});
    return await toastLocator.first().innerText().catch(() => '');
  }

  async selectMuiDropdown(fieldIdOrPlaceholder, optionText) {
    // Try finding by id, placeholder, or label
    let field = this.page.locator(`#${fieldIdOrPlaceholder}, input[name="${fieldIdOrPlaceholder}"], [placeholder="${fieldIdOrPlaceholder}"]`).first();
    
    if (!(await field.count())) {
      field = this.page.getByLabel(fieldIdOrPlaceholder, { exact: false }).first();
    }

    if (await field.count()) {
      await field.click();

      // Wait for dynamic options to load
      const optionLocator = this.page.locator('li[role="option"], .MuiAutocomplete-option, .MuiMenuItem-root');
      await optionLocator.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      if (optionText) {
        const option = optionLocator.filter({ hasText: optionText }).first();
        if (await option.count()) {
          await option.click();
          await this.page.waitForTimeout(300);
          return;
        }
      }

      if (await optionLocator.count()) {
        await optionLocator.first().click();
        await this.page.waitForTimeout(300);
        return;
      }
      
      // Fallback: type text and press Enter or ArrowDown
      if (optionText) {
        await field.fill(optionText);
        await this.page.waitForTimeout(400);
        const filteredOption = this.page.locator('li[role="option"], .MuiAutocomplete-option').first();
        if (await filteredOption.count()) {
          await filteredOption.click();
        } else {
          await this.page.keyboard.press('ArrowDown');
          await this.page.keyboard.press('Enter');
        }
      }
      await this.page.waitForTimeout(300);
    }
  }
}

module.exports = BasePage;
