# 🎭 Playwright E2E Automation - Hadir Magang

[![Playwright Tests CI/CD](https://github.com/koswara-dev/playwright-magang/actions/workflows/playwright.yml/badge.svg)](https://github.com/koswara-dev/playwright-magang/actions/workflows/playwright.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-brightgreen)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-v1.50%2B-blue)](https://playwright.dev/)
[![Browser](https://img.shields.io/badge/Browser-Google%20Chrome%20(Headless)-orange)](https://www.google.com/chrome/)

Automated End-to-End (E2E) testing framework built with **Playwright**, **Node.js**, and the **Page Object Model (POM)** pattern for the **User Registration** feature (`/management/user-v2/register`) of **Hadir Magang** ([https://magang.dikahadir.com](https://magang.dikahadir.com)).

---

## 🚀 Key Features

- **Page Object Model (POM):** Clean architectural separation of page locators, actions, and test assertions (`BasePage`, `LoginPage`, `RegisterUserPage`).
- **Google Chrome Headless Default:** Configured to run tests in Google Chrome default headless mode.
- **Session State Reuse (`storageState`):** Automated authentication setup (`auth.setup.js`) logs in once and reuses the session state across tests, eliminating repetitive login overhead.
- **Base64 Credential Security:** Passwords are stored in Base64 encoded format (`ADMIN_PASSWORD_BASE64`) and decoded at runtime without any hardcoded plain-text credentials.
- **Dynamic Test Data:** `@faker-js/faker` dynamically generates unique NIKs, Indonesian employee names, and corporate emails to prevent duplicate key collisions.
- **Automated Excel Test Scenarios Matrix:** Formatted `.xlsx` test matrix generated via `exceljs` (`test-scenarios/Skenario_Test_Register_User.xlsx`).
- **Continuous Integration (CI/CD):** Fully automated GitHub Actions workflow executing tests and archiving HTML test reports & Excel matrices on every push and PR.

---

## 📁 Project Structure

```text
playwright-magang/
├── .github/
│   └── workflows/
│       └── playwright.yml              # GitHub Actions CI/CD pipeline
├── .env                                # Local environment secrets (ignored by git)
├── .env.example                        # Safe environment template
├── .gitignore                          # Git ignore definitions
├── package.json                        # Dependencies, metadata & test scripts
├── playwright.config.js                # Playwright configuration (Chrome headless, POM, setup)
├── generate-scenarios-xlsx.js          # Generator script for Excel test scenario matrix
├── test-scenarios/
│   └── Skenario_Test_Register_User.xlsx # Formatted QA Test Matrix (Positive, Negative, Security)
├── src/
│   ├── pages/
│   │   ├── BasePage.js                 # Reusable interaction methods & MUI dropdown helpers
│   │   ├── LoginPage.js                # Authentication Page Object
│   │   └── RegisterUserPage.js         # Register User V2 Form Page Object
│   ├── fixtures/
│   │   ├── sample_avatar.png           # Valid dummy avatar image (< 2MB)
│   │   └── invalid_document.txt        # Invalid non-image file for validation testing
│   └── utils/
│       └── dataHelper.js               # Faker generator for user payloads & fixtures
└── tests/
    ├── auth.setup.js                   # Global login setup & Base64 password resolver
    └── user-register.spec.js           # Positive, Negative & Security test suites
```

---

## 📋 Test Scenarios Overview

The test cases are documented in [Skenario_Test_Register_User.xlsx](file:///test-scenarios/Skenario_Test_Register_User.xlsx):

| Test Case ID | Category | Scenario Title | Execution |
| :--- | :--- | :--- | :--- |
| **TC-REG-POS-001** | Positive / Happy Path | Register user with complete and valid data & avatar upload | Automated |
| **TC-REG-POS-002** | Positive / Happy Path | Register user with optional upliner left empty | Automated |
| **TC-REG-POS-003** | Positive / Happy Path | Register user with Shift work type and schedule | Automated |
| **TC-REG-POS-004** | Positive / Happy Path | Register user with Required Selfie setting | Automated |
| **TC-REG-NEG-001** | Negative / Validation | Submit registration without uploading employee photo (`Foto tidak boleh kosong`) | Automated |
| **TC-REG-NEG-002** | Negative / Validation | Upload invalid file format (.txt/.pdf) for photo | Automated |
| **TC-REG-NEG-003** | Negative / Boundary | Upload employee photo exceeding 2 MB size limit | Automated |
| **TC-REG-NEG-004** | Negative / Validation | Submit form with all mandatory fields empty | Automated |
| **TC-REG-NEG-005** | Negative / Validation | Submit with invalid email format (missing `@` / domain) | Automated |
| **TC-REG-NEG-006** | Negative / Validation | Register user with already registered duplicate email | Automated |
| **TC-REG-NEG-007** | Negative / Boundary | Submit with negative leave amount (Cuti < 0) | Automated |
| **TC-REG-NEG-008** | Negative / Validation | Submit with unselected work dropdowns (Divisi/Unit empty) | Automated |
| **TC-REG-SEC-001** | Security / Robustness | XSS payload injection probing in Nama Karyawan | Automated |
| **TC-REG-SEC-002** | Security / Robustness | SQL Injection probing in NIK field | Automated |
| **TC-REG-SEC-003** | Security / Access | Direct URL access to registration page without login | Automated |

---

## 🛠️ Prerequisites

- **Node.js:** v20+ or v22+
- **NPM:** v10+
- **Google Chrome:** Installed on system (or auto-installed in CI)

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/koswara-dev/playwright-magang.git
   cd playwright-magang
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright Google Chrome browser:**
   ```bash
   npx playwright install chrome
   ```

4. **Configure environment variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your Base64 encoded password in `.env`:
   ```env
   BASE_URL=https://magang.dikahadir.com
   ADMIN_EMAIL=admin@hadir.com
   ADMIN_PASSWORD_BASE64=TWFnYW5nU1FBX0pDQDEyMw==
   HEADLESS=true
   ```

---

## 🧪 Running Tests

| Command | Description |
| :--- | :--- |
| `npm test` | Run all E2E tests in Google Chrome headless mode |
| `npm run test:headed` | Run tests with visible Chrome browser window |
| `npm run test:positive` | Run only positive test scenarios (`@positive`) |
| `npm run test:negative` | Run only negative validation test scenarios (`@negative`) |
| `npm run test:report` | Open the generated Playwright HTML Test Report |
| `npm run generate:scenarios` | Regenerate the formatted Excel test scenarios spreadsheet |

---

## 🤖 GitHub Actions CI/CD

The workflow in `.github/workflows/playwright.yml` runs on:
- Every `push` to `main`
- Every `pull_request` to `main`
- Manual trigger via `workflow_dispatch`

### Workflow Pipeline:
1. Checks out repository.
2. Sets up Node.js 20 with npm dependency caching.
3. Installs dependencies (`npm ci`).
4. Verifies/updates the Excel test matrix (`node generate-scenarios-xlsx.js`).
5. Installs Google Chrome with Linux dependencies (`npx playwright install --with-deps chrome`).
6. Executes Playwright test suites.
7. Uploads **Playwright HTML Report** and **Excel Test Scenarios Matrix** as downloadable artifacts (retained for 14 days).

### GitHub Secrets (Optional / Recommended):
In repository settings (`Settings > Secrets and variables > Actions`):
- `ADMIN_EMAIL`: `admin@hadir.com`
- `ADMIN_PASSWORD_BASE64`: `TWFnYW5nU1FBX0pDQDEyMw==`

---

## 📄 License
ISC License © JuaraCoding SQA Batch 31
