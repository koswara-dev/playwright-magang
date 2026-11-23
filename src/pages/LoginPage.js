const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.emailInput = page.locator('input[type="email"], input[name="email"], #email').first();
    this.passwordInput = page.locator('input[type="password"], input[name="password"], #password').first();
    this.submitButton = page.locator('button[type="submit"], button:has-text("Masuk")').first();
  }

  async goto() {
    await this.navigate('/authentication/login');
  }

  async login(email, password) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async isLoggedIn() {
    // Check if redirected away from login or presence of admin sidebar/header
    await this.page.waitForURL(url => !url.pathname.includes('/authentication/login'), { timeout: 15000 }).catch(() => {});
    return !this.page.url().includes('/authentication/login');
  }
}

module.exports = LoginPage;
