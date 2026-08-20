import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING ADMIN & ROLE-BASED ACCESS TESTS ---');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Unauthenticated request to Admin API
  try {
    const res = await fetch(`${BASE_URL}/admin/applications`);
    const data = await res.json();
    assert(res.status === 401, `Unauthenticated user calling admin API returns 401 (Got: ${res.status})`);
  } catch (err) {
    console.error('Test 1 error:', err);
    failed++;
  }

  // 2. Admin Login
  let adminToken = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ezfinanz.com',
        password: 'Admin@123456'
      })
    });
    const json = await res.json();
    assert(res.status === 200, `Admin login returns 200 status (Got: ${res.status})`);
    assert(json.success === true, `Admin login success flag is true`);
    assert(json.data?.role === 'ADMIN', `Admin login returns role 'ADMIN' (Got: ${json.data?.role})`);
    assert(!!json.data?.token, `Admin login returns JWT token`);
    adminToken = json.data?.token;
  } catch (err) {
    console.error('Test 2 error:', err);
    failed++;
  }

  // 3. Customer Registration & Login
  const testCustomerEmail = `customer_${Date.now()}@example.com`;
  let customerToken = null;
  try {
    // Attempt registering with role="ADMIN" to verify it cannot elevate privileges
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: testCustomerEmail,
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        password: 'Password@123',
        role: 'ADMIN' // Trying to register as ADMIN
      })
    });
    const regJson = await regRes.json();
    assert(regRes.status === 201, `Customer registered successfully`);
    assert(regJson.data?.role === 'CUSTOMER', `Customer registration forces role to 'CUSTOMER' despite request passing 'ADMIN' (Got: ${regJson.data?.role})`);
    customerToken = regJson.data?.token;
  } catch (err) {
    console.error('Test 3 error:', err);
    failed++;
  }

  // 4. Customer Login
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: 'Password@123'
      })
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200, `Customer login returns 200`);
    assert(loginJson.data?.role === 'CUSTOMER', `Customer login returns role 'CUSTOMER'`);
  } catch (err) {
    console.error('Test 4 error:', err);
    failed++;
  }

  // 5. Customer calling Admin API -> Expected 403 Forbidden
  try {
    const adminRes = await fetch(`${BASE_URL}/admin/applications`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    });
    assert(adminRes.status === 403, `Customer token calling admin API returns 403 Forbidden (Got: ${adminRes.status})`);
  } catch (err) {
    console.error('Test 5 error:', err);
    failed++;
  }

  // 6. Admin calling Admin API -> Expected 200 OK
  try {
    const adminRes = await fetch(`${BASE_URL}/admin/applications`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(adminRes.status === 200, `Admin token calling admin API returns 200 OK (Got: ${adminRes.status})`);
  } catch (err) {
    console.error('Test 6 error:', err);
    failed++;
  }

  console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  process.exit(failed === 0 ? 0 : 1);
}

runTests();
