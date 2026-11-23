const { fakerID_ID: faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

class DataHelper {
  static generateValidUser() {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const nik = `3175${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullname = `${firstName} ${lastName}`;
    const email = `qa.auto.${Date.now()}.${randomSuffix}@dikahadir.com`;
    const password = 'Password123#';

    return {
      nik,
      fullname,
      email,
      password,
      divisi: 'Information & Technology',
      unit: 'Software Quality Assurance',
      posisiKerja: 'Senior QA Automation Engineer',
      jabatan: 'Officer / Staff',
      tipeKontrak: 'Karyawan Tetap',
      lokasiKerja: 'Head Office',
      tipeShift: 'Non Shift',
      jadwalKerja: 'Regular',
      selfie: 'No Selfie',
      jumlahCuti: 12
    };
  }

  static getSampleAvatarPath() {
    const fixtureDir = path.join(__dirname, '../fixtures');
    if (!fs.existsSync(fixtureDir)) {
      fs.mkdirSync(fixtureDir, { recursive: true });
    }
    const avatarPath = path.join(fixtureDir, 'sample_avatar.png');
    
    // Generate valid 1x1 transparent PNG if doesn't exist
    if (!fs.existsSync(avatarPath)) {
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      fs.writeFileSync(avatarPath, Buffer.from(pngBase64, 'base64'));
    }
    return avatarPath;
  }

  static getInvalidFilePath() {
    const fixtureDir = path.join(__dirname, '../fixtures');
    if (!fs.existsSync(fixtureDir)) {
      fs.mkdirSync(fixtureDir, { recursive: true });
    }
    const invalidPath = path.join(fixtureDir, 'invalid_document.txt');
    if (!fs.existsSync(invalidPath)) {
      fs.writeFileSync(invalidPath, 'This is a dummy text file, not an image.');
    }
    return invalidPath;
  }
}

module.exports = DataHelper;
