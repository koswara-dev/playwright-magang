const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateTestScenariosExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'JuaraCoding SQA Batch 31';
  workbook.lastModifiedBy = 'JuaraCoding QA Team';
  workbook.created = new Date();
  workbook.modified = new Date();

  // 1. Sheet: Register User Test Matrix
  const sheet = workbook.addWorksheet('Register User Scenarios', {
    pageSetup: { orientation: 'landscape', fitToPage: true }
  });

  // Define Columns
  sheet.columns = [
    { header: 'Test Case ID', key: 'id', width: 18 },
    { header: 'Module / Feature', key: 'module', width: 24 },
    { header: 'Scenario Title', key: 'title', width: 36 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Pre-Condition', key: 'precondition', width: 32 },
    { header: 'Test Steps', key: 'steps', width: 44 },
    { header: 'Test Data', key: 'testData', width: 36 },
    { header: 'Expected Result', key: 'expectedResult', width: 38 },
    { header: 'Execution Type', key: 'execType', width: 16 },
    { header: 'Status', key: 'status', width: 14 }
  ];

  const scenarios = [
    // --- POSITIVE SCENARIOS ---
    {
      id: 'TC-REG-POS-001',
      module: 'User Management - Register',
      title: 'Register user with complete and valid data',
      category: 'Positive / Happy Path',
      priority: 'P1 - Critical',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Upload valid avatar image (<2MB)\n2. Fill unique NIK & Fullname\n3. Fill unique Email & valid Password\n4. Select Divisi, Unit, Posisi, Jabatan\n5. Select Tipe Kontrak, Lokasi, Non-Shift\n6. Select Selfie requirement & input Cuti\n7. Click "Submit"',
      testData: 'NIK: 16-digit unique\nFullname: Budi QA\nEmail: unique@hadir.com\nPass: MagangSQA@123\nDivisi: IT, Unit: SQA\nFoto: avatar.png (50KB)',
      expectedResult: 'Toast success "Berhasil mendaftarkan user" is displayed and redirected to /management/user',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-POS-002',
      module: 'User Management - Register',
      title: 'Register user with optional upliner left empty',
      category: 'Positive / Happy Path',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Fill all mandatory fields\n2. Leave Atasan, Atasan V2, and Atasan V3 empty\n3. Click "Submit"',
      testData: 'Valid mandatory payload, upliner fields: null / empty',
      expectedResult: 'User registration succeeds without requiring upliner',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-POS-003',
      module: 'User Management - Register',
      title: 'Register user with Shift work type and schedule',
      category: 'Positive / Happy Path',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Fill all mandatory fields\n2. Select Tipe Shift: "Shift"\n3. Select active Jadwal Kerja shift\n4. Click "Submit"',
      testData: 'Shift Type: SHIFT, Schedule: Shift Pagi/Malam',
      expectedResult: 'User successfully registered with Shift work configuration',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-POS-004',
      module: 'User Management - Register',
      title: 'Register user with Required Selfie setting',
      category: 'Positive / Happy Path',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Fill all mandatory fields\n2. Select Selfie: "Selfie"\n3. Click "Submit"',
      testData: 'required_selfie: true',
      expectedResult: 'User registered with mandatory selfie attendance setting',
      execType: 'Automated',
      status: 'Ready'
    },

    // --- NEGATIVE SCENARIOS (VALIDATION) ---
    {
      id: 'TC-REG-NEG-001',
      module: 'User Management - Register',
      title: 'Submit registration without uploading employee photo',
      category: 'Negative / Validation',
      priority: 'P1 - Critical',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Leave Foto Karyawan empty\n2. Fill all other mandatory fields\n3. Click "Submit"',
      testData: 'Avatar: none, other fields: valid',
      expectedResult: 'System displays error notification "Foto tidak boleh kosong" and aborts submission',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-NEG-002',
      module: 'User Management - Register',
      title: 'Upload invalid file type (non-image .txt/.pdf) for photo',
      category: 'Negative / Validation',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Click Upload and choose document.pdf / dummy.txt\n2. Observe input behavior and validation',
      testData: 'File: dummy_document.txt (text/plain)',
      expectedResult: 'Input rejected with message "File harus berupa gambar" or file picker restricted to image/*',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-NEG-003',
      module: 'User Management - Register',
      title: 'Upload employee photo exceeding 2 MB size limit',
      category: 'Negative / Validation',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Select an image file with size > 2.5 MB\n2. Observe UI and validation toast',
      testData: 'File: large_avatar.png (2.8 MB)',
      expectedResult: 'Validation error "File harus dibawah 2 MB" is displayed',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-NEG-004',
      module: 'User Management - Register',
      title: 'Submit form with all mandatory fields empty',
      category: 'Negative / Validation',
      priority: 'P1 - Critical',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Open registration page\n2. Immediately click "Submit" without filling any field',
      testData: 'All inputs empty',
      expectedResult: 'Form is not submitted; mandatory field validation highlights required inputs',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-NEG-005',
      module: 'User Management - Register',
      title: 'Submit with invalid email format (missing @ / domain)',
      category: 'Negative / Validation',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Fill photo and other mandatory fields\n2. Enter invalid email e.g. "budi.hadir.com"\n3. Click "Submit"',
      testData: 'Email: budi.hadir.com (no @)',
      expectedResult: 'HTML5/Form validation prevents submission with email format error',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-NEG-006',
      module: 'User Management - Register',
      title: 'Register user with already registered duplicate email',
      category: 'Negative / Validation',
      priority: 'P1 - Critical',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Fill all valid fields\n2. Use already existing email "admin@hadir.com"\n3. Click "Submit"',
      testData: 'Email: admin@hadir.com (existing)',
      expectedResult: 'Server returns error toast / validation warning indicating email is already taken',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-NEG-007',
      module: 'User Management - Register',
      title: 'Submit with negative leave amount (Cuti < 0)',
      category: 'Negative / Boundary',
      priority: 'P3 - Medium',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Fill all valid fields\n2. Enter "-5" into Jumlah Cuti field\n3. Click "Submit"',
      testData: 'jumlah-cuti: -5',
      expectedResult: 'Field blocks negative input or validation warns invalid leave value',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-NEG-008',
      module: 'User Management - Register',
      title: 'Submit with unselected work dropdowns (Divisi/Unit empty)',
      category: 'Negative / Validation',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Upload photo and fill account info\n2. Leave Divisi, Unit, Posisi empty\n3. Click "Submit"',
      testData: 'Divisi: unselected, Unit: unselected',
      expectedResult: 'Submission blocked; required work info dropdowns highlighted',
      execType: 'Automated',
      status: 'Ready'
    },

    // --- SECURITY & ROBUSTNESS SCENARIOS ---
    {
      id: 'TC-REG-SEC-001',
      module: 'User Management - Register',
      title: 'XSS payload injection in Nama Karyawan',
      category: 'Security / Robustness',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Enter `<script>alert("xss")</script>` into Nama Karyawan\n2. Fill other fields & submit\n3. Verify response and rendered view',
      testData: 'Fullname: <script>alert("xss")</script>',
      expectedResult: 'Payload is sanitized/escaped; script is not executed anywhere on page or list',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-SEC-002',
      module: 'User Management - Register',
      title: 'SQL Injection probing in NIK field',
      category: 'Security / Robustness',
      priority: 'P2 - High',
      precondition: 'Admin logged in; on /management/user-v2/register',
      steps: '1. Enter `\' OR \'1\'=\'1` into NIK field\n2. Fill other fields & submit',
      testData: 'NIK: \' OR \'1\'=\'1',
      expectedResult: 'System handles safely as literal string or validates numeric format without SQL error',
      execType: 'Automated',
      status: 'Ready'
    },
    {
      id: 'TC-REG-SEC-003',
      module: 'User Management - Register',
      title: 'Direct URL access to registration page without login',
      category: 'Security / Access Control',
      priority: 'P1 - Critical',
      precondition: 'Browser session has no authentication cookies / unauthenticated',
      steps: '1. Open browser in incognito / clean context\n2. Navigate directly to /management/user-v2/register',
      testData: 'Direct URL navigation',
      expectedResult: 'User is redirected immediately to /authentication/login (HTTP 307 / client router)',
      execType: 'Automated',
      status: 'Ready'
    }
  ];

  // Add rows
  scenarios.forEach(sc => sheet.addRow(sc));

  // Style Header Row
  const headerRow = sheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Segoe UI' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' } // Enterprise Primary Blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      left: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      bottom: { style: 'medium', color: { argb: 'FF0D47A1' } },
      right: { style: 'thin', color: { argb: 'FFB0BEC5' } }
    };
  });

  // Style Data Rows
  for (let i = 2; i <= scenarios.length + 1; i++) {
    const row = sheet.getRow(i);
    row.height = 42;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
      };

      // Center specific columns
      if ([1, 4, 5, 10, 11].includes(colNumber)) {
        cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true };
      }

      // Priority formatting
      if (colNumber === 5) {
        if (cell.value && cell.value.includes('P1')) {
          cell.font = { bold: true, color: { argb: 'FFD32F2F' } }; // Red
        } else if (cell.value && cell.value.includes('P2')) {
          cell.font = { bold: true, color: { argb: 'FFE65100' } }; // Orange
        } else {
          cell.font = { bold: true, color: { argb: 'FF2E7D32' } }; // Green
        }
      }

      // Category formatting
      if (colNumber === 4) {
        if (cell.value && cell.value.includes('Positive')) {
          cell.font = { color: { argb: 'FF1B5E20' }, bold: true };
        } else if (cell.value && cell.value.includes('Negative')) {
          cell.font = { color: { argb: 'FFB71C1C' }, bold: true };
        } else if (cell.value && cell.value.includes('Security')) {
          cell.font = { color: { argb: 'FF4A148C' }, bold: true };
        }
      }

      // Alternate row backgrounds
      if (i % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }
    });
  }

  // Ensure output directory exists
  const targetDir = path.join(__dirname, 'test-scenarios');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const outputPath = path.join(targetDir, 'Skenario_Test_Register_User.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`\n>>> Successfully generated Excel test scenarios at: ${outputPath}`);
  return outputPath;
}

generateTestScenariosExcel().catch(err => {
  console.error('Failed to generate Excel test matrix:', err);
  process.exit(1);
});
