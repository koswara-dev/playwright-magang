const https = require('https');

const cookie = 'hadir_web_magang=Fe26.2*1*12a34cf4239c2acd5ec4d041144648871f2b836f5936ef04ca3727609468967a*4LtcYJh2mEqb54OFDK8LTw*e1bB5VphHSNL6PEGfdjleV-2TxbJv7_GGAmrgF9_LToAjGpatDq8-UfqObIzP7urPAlsVmW0hzBtCyHc8caVWOIDNcV8Y1j1jBNNHDXBN0du7eAxYelJpov6VZR1gFu-7_gt_a_18U6C8g3xOT74TXPhA_h0JloTq2_skFgb0C-LUJHJ5xMBNo5FaoPEEBArQ72b8blD-fKO1WsVvGaJCrxM1ITFQ_yjJDLje47tb5TsMBDSNoigutgxOm5BXa55AsEv_go7LQgiCIbGtsqBx9WV5RmN00EZaDc8fql3rtezW_eZyrxprpU0ZGHtijA4tWwBCJiCcB8OTNxb8IjZYEyQSy3Nkm3I_3QRSomEpq3VTvj-18pBb8blZJQoEmh27hDyT20FeX0l1AP4MAnkhkDbza1-zCSZvTjDc-y9He21huKYadz2w_nTKCe-dAhKHNDQS4Id09gl4o02hV5xnbE_bueZ6HzA_17I00us47CnkotJxMOgxszmoRmlp0N8Fu3Ze4hVY5ohJAuSc0x4Fq0LPN66dSScVo6tr7TVKB5hDH4Y8ok3FOjhvwytreYmyBSCueRvG46UPP2_8zIz3-4Xh7jWIF6DPjOkWgs88o19vFZ4ltEpXztrZmu2gOOndFquab0mids5ZuUqs-LO6AXX2LHaT6fDb6ogwG5UwHs*1796214230168*0a81ef6cc938bb65baf879edb0e2eae0ddfbe0fa879306cb0327f2176fdf1e00*K4G3AWtdtDeV8yidM_KlfjObtA7XTV9eYAvR_xGOYEQ~2';

function api(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'magang.dikahadir.com',
      port: 443,
      path,
      method,
      headers: {
        'Cookie': cookie,
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function seed() {
  console.log('====================================================');
  console.log('START SEEDING REAL ORGANIZATIONAL DATA VIA REST API');
  console.log('====================================================\n');

  // 1. DIVISI
  console.log('>>> [1/6] Seeding Divisi...');
  const divisions = [
    'Information & Technology',
    'Human Capital & Operations',
    'Finance & Accounting',
    'Business Development & Sales'
  ];
  const createdDivisions = [];
  for (const name of divisions) {
    const res = await api('/api/division', 'POST', { name });
    console.log(`  Divisi "${name}": status ${res.status}`);
    createdDivisions.push({ name, res: res.data });
  }

  // 2. UNIT (DEPARTEMENS)
  console.log('\n>>> [2/6] Seeding Unit (Departemens)...');
  const units = [
    'Software Quality Assurance',
    'Core Engineering',
    'People Operations & HR',
    'Financial Planning & Tax'
  ];
  const unitMap = {};
  for (const name of units) {
    const payload = {
      name,
      location_type: 1, // Tetap
      calendar_id: null,
      unit_leave_id: null,
      overtime_reason_id: null,
      max_day_ot: null,
      ot_upload: false
    };
    const res = await api('/api/departemens', 'POST', payload);
    console.log(`  Unit "${name}": status ${res.status}`);
    // If response contains id or let's fetch from list
    unitMap[name] = res.data;
  }

  // Fetch created units to get their IDs
  const allUnitsRes = await api('/api/departemens');
  const unitList = allUnitsRes.data && allUnitsRes.data.data ? allUnitsRes.data.data : [];
  for (const u of unitList) {
    if (units.includes(u.name)) {
      unitMap[u.name] = u.id;
    }
  }
  console.log('  Resolved Unit IDs:', unitMap);

  // 3. UNIT SETTING (DEPARTEMENTS-SETTINGS)
  console.log('\n>>> [3/6] Seeding Unit Setting...');
  const targetSettings = ['Software Quality Assurance', 'Core Engineering'];
  for (const uName of targetSettings) {
    const unitId = unitMap[uName];
    if (unitId) {
      const res = await api('/api/departements-settings', 'POST', {
        job_departement_id: unitId,
        required_selfie: true
      });
      console.log(`  Unit Setting for "${uName}" (${unitId}): status ${res.status}`);
    } else {
      console.log(`  ERROR: Could not resolve unit ID for ${uName}`);
    }
  }

  // 4. POSISI
  console.log('\n>>> [4/6] Seeding Posisi...');
  const positions = [
    { name: 'Senior QA Automation Engineer', unit: 'Software Quality Assurance' },
    { name: 'Backend Golang Developer', unit: 'Core Engineering' },
    { name: 'HR Business Partner', unit: 'People Operations & HR' },
    { name: 'Financial Analyst', unit: 'Financial Planning & Tax' }
  ];
  for (const pos of positions) {
    const unitId = unitMap[pos.unit];
    if (unitId) {
      const res = await api('/api/position', 'POST', {
        name: pos.name,
        job_departements_id: unitId
      });
      console.log(`  Posisi "${pos.name}" [Unit: ${pos.unit}]: status ${res.status}`);
    } else {
      console.log(`  ERROR: Missing unit ID for position ${pos.name}`);
    }
  }

  // 5. CLIENT UPLINER
  console.log('\n>>> [5/6] Seeding Client Upliner...');
  const upliners = [
    {
      fullname: 'Budi Wicaksono (Lead QA)',
      email: 'budi.qa.lead@dikahadir.com',
      password: 'Password123#',
      unit: 'Software Quality Assurance'
    },
    {
      fullname: 'Rian Pratama (Engineering Manager)',
      email: 'rian.em@dikahadir.com',
      password: 'Password123#',
      unit: 'Core Engineering'
    }
  ];

  for (const up of upliners) {
    const unitId = unitMap[up.unit];
    const payload = {
      fullname: up.fullname,
      email: up.email,
      password: up.password,
      nik: '0',
      role_id: 'client',
      job_position_id: null,
      job_level_id: null,
      upliner_id: null,
      employee_type_id: null,
      job_departement_id: unitId || null,
      leave_amount: 0,
      shifting_id: null,
      shift_type: 'NON_SHIFT',
      location_point_id: null,
      isVerified: true,
      job_level: null,
      schedule_id: null,
      required_selfie: null
    };
    const res = await api('/api/v2/users', 'POST', payload);
    console.log(`  Upliner "${up.fullname}" (${up.email}): status ${res.status}`, res.data ? JSON.stringify(res.data) : '');
  }

  // 6. JABATAN
  console.log('\n>>> [6/6] Seeding Jabatan...');
  const jobLevels = [
    { name: 'Division Head', level: 1 },
    { name: 'Department Manager', level: 2 },
    { name: 'Team Lead / Supervisor', level: 3 },
    { name: 'Senior Specialist', level: 4 },
    { name: 'Officer / Staff', level: 5 }
  ];

  for (const jl of jobLevels) {
    const res = await api('/api/joblevels', 'POST', {
      name: jl.name,
      level: jl.level
    });
    console.log(`  Jabatan "${jl.name}" (Level ${jl.level}): status ${res.status}`);
  }

  console.log('\n====================================================');
  console.log('SEEDING COMPLETE!');
  console.log('====================================================');
}

seed();
