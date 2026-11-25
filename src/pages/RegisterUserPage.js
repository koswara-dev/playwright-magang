const BasePage = require('./BasePage');

class RegisterUserPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // File Upload
    this.fileInput = page.locator('input[type="file"]').first();
    this.uploadButton = page.locator('label:has-text("Upload"), button:has-text("Upload")').first();
    this.deletePhotoButton = page.locator('button:has-text("Hapus")').first();

    // Account Information
    this.nikInput = page.locator('#nik, input[name="nik"]').first();
    this.fullnameInput = page.locator('#fullname, input[name="fullname"]').first();
    this.emailInput = page.locator('#email, input[name="email"]').first();
    this.passwordInput = page.locator('#password, input[name="password"]').first();
    this.togglePasswordVisibility = page.locator('svg[data-testid="VisibilityIcon"], svg[data-testid="VisibilityOffIcon"], .feather-eye, .feather-eye-off').first();

    // Work Information
    this.divisiInput = page.locator('#divisi, input[placeholder*="Divisi"]').first();
    this.unitInput = page.locator('#unit, input[placeholder*="Unit"]').first();
    this.posisiInput = page.locator('#posisi-kerja, input[placeholder*="Posisi"]').first();
    this.jabatanInput = page.locator('#jabatan, input[placeholder*="Jabatan"]').first();
    this.atasanInput = page.locator('#atasan, input[placeholder*="Atasan"]').first();
    this.tipeKontrakInput = page.locator('#tipe-kontrak, input[placeholder*="Kontrak"]').first();

    // Attendance Settings
    this.lokasiInput = page.locator('#lokasi-kerja, input[placeholder*="Lokasi"]').first();
    this.shiftTypeInput = page.locator('#shift_type, input[placeholder*="Shift"]').first();
    this.jadwalInput = page.locator('#jadwal-kerja, input[placeholder*="Jadwal"]').first();
    this.selfieInput = page.locator('#required_selfie, input[placeholder*="Selfie"]').first();
    this.cutiInput = page.locator('#jumlah-cuti, input[name="jumlah-cuti"], input[type="number"]').first();

    // Action Submit
    this.submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();
  }

  async goto() {
    await this.navigate('/management/user-v2/register');
    await this.waitForNetworkIdle();
  }

  async uploadPhoto(filePath) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(500);
  }

  async fillAccountInformation({ nik, fullname, email, password }) {
    if (nik !== undefined) await this.nikInput.fill(nik);
    if (fullname !== undefined) await this.fullnameInput.fill(fullname);
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
  }

  async selectFirstAvailableOption(fieldLocator) {
    if (await fieldLocator.count()) {
      await fieldLocator.click();

      // Wait for dynamic API options with a reasonable 1.5s timeout
      const optionLocator = this.page.locator('li[role="option"], .MuiAutocomplete-option, .MuiMenuItem-root');
      await optionLocator.first().waitFor({ state: 'visible', timeout: 1500 }).catch(() => {});

      if (await optionLocator.count()) {
        await optionLocator.first().click();
      } else {
        await this.page.keyboard.press('ArrowDown');
        await this.page.keyboard.press('Enter');
      }
      await this.page.waitForTimeout(200);
    }
  }

  async fillWorkInformation({ divisi, unit, posisi, jabatan, tipeKontrak } = {}) {
    if (divisi) {
      await this.selectMuiDropdown('divisi', divisi);
    } else {
      await this.selectFirstAvailableOption(this.divisiInput);
    }

    if (unit) {
      await this.selectMuiDropdown('unit', unit);
    } else {
      await this.selectFirstAvailableOption(this.unitInput);
    }

    if (posisi) {
      await this.selectMuiDropdown('posisi-kerja', posisi);
    } else {
      await this.selectFirstAvailableOption(this.posisiInput);
    }

    if (jabatan) {
      await this.selectMuiDropdown('jabatan', jabatan);
    } else {
      await this.selectFirstAvailableOption(this.jabatanInput);
    }

    if (tipeKontrak) {
      await this.selectMuiDropdown('tipe-kontrak', tipeKontrak);
    } else {
      await this.selectFirstAvailableOption(this.tipeKontrakInput);
    }
  }

  async fillPengaturanAbsensi({ lokasi, tipeShift, jadwal, selfie, jumlahCuti } = {}) {
    if (lokasi) {
      await this.selectMuiDropdown('lokasi-kerja', lokasi);
    } else {
      await this.selectFirstAvailableOption(this.lokasiInput);
    }

    if (tipeShift) {
      await this.selectMuiDropdown('shift_type', tipeShift);
    } else {
      await this.selectFirstAvailableOption(this.shiftTypeInput);
    }

    if (jadwal) {
      await this.selectMuiDropdown('jadwal-kerja', jadwal);
    } else {
      await this.selectFirstAvailableOption(this.jadwalInput);
    }

    if (selfie) {
      await this.selectMuiDropdown('required_selfie', selfie);
    } else {
      await this.selectFirstAvailableOption(this.selfieInput);
    }

    if (jumlahCuti !== undefined && (await this.cutiInput.count())) {
      await this.cutiInput.fill(String(jumlahCuti));
    }
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = RegisterUserPage;
