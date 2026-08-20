import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api';

async function testAdminWorkflow() {
  console.log('=== STARTING ADMIN WORKFLOW END-TO-END TESTS ===');
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

  // 1. Admin Login
  let adminToken = null;
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ezfinanz.com',
      password: 'Admin@123456'
    })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Admin login succeeds with 200 OK');
  assert(loginData.data?.role === 'ADMIN', 'Admin role verified in token');
  adminToken = loginData.data?.token;

  // 2. Customer Registration & Application Initialization
  const custEmail = `priya_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: custEmail,
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: 'Password@123'
    })
  });
  const regData = await regRes.json();
  const customerToken = regData.data?.token;

  // Fetch /applications/me to initialize application
  const meRes = await fetch(`${BASE_URL}/applications/me`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const meData = await meRes.json();
  const appId = meData.data?._id;
  assert(!!appId, `Application initialized with ID #${meData.data?.applicationNumber}`);

  // Test Prerequisite: Attempt approving incomplete application (No KYC)
  const prematureApproveRes = await fetch(`${BASE_URL}/admin/applications/${appId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  assert(prematureApproveRes.status === 400, 'Attempting to approve without KYC returns 400 Bad Request');

  // Submit KYC
  const kycRes = await fetch(`${BASE_URL}/applications/${appId}/kyc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      fullName: 'Priya Sharma',
      dob: '1995-05-15',
      gender: 'FEMALE',
      address: '123 MG Road, Bengaluru, Karnataka',
      idType: 'PAN',
      idNumber: 'ABCPS1234F'
    })
  });
  assert(kycRes.status === 200, 'KYC submitted successfully');

  // Submit Eligibility
  const eligRes = await fetch(`${BASE_URL}/applications/${appId}/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      incomeType: 'MONTHLY',
      monthlyIncome: 85000,
      requestedLoanAmount: 300000,
      creditScore: 780,
      monthlyDebt: 10000,
      employerName: 'Infosys Ltd',
      designation: 'Senior Software Engineer'
    })
  });
  assert(eligRes.status === 200, 'Eligibility calculated and submitted');

  // Submit Loan Terms
  const loanRes = await fetch(`${BASE_URL}/applications/${appId}/loan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      amount: 300000,
      tenure: 24
    })
  });
  assert(loanRes.status === 200, 'Loan terms confirmed and saved');

  // Submit Bank Details
  const bankRes = await fetch(`${BASE_URL}/applications/${appId}/bank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      accountHolderName: 'Priya Sharma',
      bankName: 'HDFC Bank',
      accountNumber: '50100234567890',
      ifsc: 'HDFC0001234',
      accountType: 'SAVINGS'
    })
  });
  assert(bankRes.status === 200, 'Bank account linked');

  // Submit Declaration
  const declRes = await fetch(`${BASE_URL}/applications/${appId}/declaration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      accepted: true,
      version: 'KFS-v2026.1'
    })
  });
  assert(declRes.status === 200, 'Declaration accepted');

  // Submit Selfie
  const selfieRes = await fetch(`${BASE_URL}/applications/${appId}/selfie`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...',
      publicId: 'test_selfie_1'
    })
  });
  assert(selfieRes.status === 200, 'Selfie submitted, stage moved to WAITING_FOR_ADMIN');

  // Test Prerequisite: Attempt approving application before selfie is approved by Admin
  const approveBeforeSelfieRes = await fetch(`${BASE_URL}/admin/applications/${appId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  assert(approveBeforeSelfieRes.status === 400, 'Attempting to approve before selfie review returns 400 Bad Request');

  // Test Prerequisite: Attempt disbursing an unapproved application
  const disburseBeforeApproveRes = await fetch(`${BASE_URL}/admin/applications/${appId}/disburse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  assert(disburseBeforeApproveRes.status === 400, 'Attempting disbursement before approval returns 400 Bad Request');

  // 3. Test GET /api/admin/applications
  const getAllRes = await fetch(`${BASE_URL}/admin/applications`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const getAllData = await getAllRes.json();
  assert(getAllRes.status === 200, 'GET /api/admin/applications returns 200 OK');
  assert(Array.isArray(getAllData.data), 'Returns applications array');
  const foundApp = getAllData.data.find(a => a._id === appId);
  assert(!!foundApp, 'Newly submitted application found in admin applications list');

  // 4. Test GET /api/admin/applications/:id
  const getSingleRes = await fetch(`${BASE_URL}/admin/applications/${appId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const getSingleData = await getSingleRes.json();
  assert(getSingleRes.status === 200, 'GET /api/admin/applications/:id returns 200 OK');
  assert(getSingleData.data?.kyc?.fullName === 'Priya Sharma', 'Application contains full KYC data');
  assert(getSingleData.data?.loanDetails?.amount === 300000, 'Application contains loan details');
  assert(getSingleData.data?.bankAccount?.bankName === 'HDFC Bank', 'Application contains bank details');

  // 5. Test POST /api/admin/applications/:id/selfie-review (Approve)
  const selfieApproveRes = await fetch(`${BASE_URL}/admin/applications/${appId}/selfie-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'APPROVED' })
  });
  const selfieApproveData = await selfieApproveRes.json();
  assert(selfieApproveRes.status === 200, 'POST /selfie-review (Approve) returns 200');
  assert(selfieApproveData.data?.adminReview?.selfieStatus === 'APPROVED', 'Selfie status updated to APPROVED');

  // 6. Test POST /api/admin/applications/:id/approve (Now valid since all prerequisites met)
  const approveAppRes = await fetch(`${BASE_URL}/admin/applications/${appId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  const approveAppData = await approveAppRes.json();
  assert(approveAppRes.status === 200, 'POST /approve returns 200 when all 8 prerequisites are satisfied');
  assert(approveAppData.data?.status === 'APPROVED', 'Application status updated to APPROVED');
  assert(approveAppData.data?.currentStage === 'APPLICATION_APPROVED', 'Current stage updated to APPLICATION_APPROVED');

  // Test Prerequisite: Attempt duplicate approval on already approved application
  const duplicateApproveRes = await fetch(`${BASE_URL}/admin/applications/${appId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  assert(duplicateApproveRes.status === 400, 'Attempting duplicate approval returns 400 Bad Request');

  // 7. Test POST /api/admin/applications/:id/disburse
  const disburseRes = await fetch(`${BASE_URL}/admin/applications/${appId}/disburse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  const disburseData = await disburseRes.json();
  assert(disburseRes.status === 200, 'POST /disburse returns 200');
  assert(disburseData.data?.status === 'DISBURSED', 'Application status updated to DISBURSED');
  assert(disburseData.data?.currentStage === 'DISBURSEMENT_CONFIRMED', 'Current stage updated to DISBURSEMENT_CONFIRMED');
  assert(!!disburseData.data?.disbursementReference, `Disbursement reference generated: ${disburseData.data?.disbursementReference}`);

  // Test Prerequisite: Attempt duplicate disbursement
  const duplicateDisburseRes = await fetch(`${BASE_URL}/admin/applications/${appId}/disburse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  assert(duplicateDisburseRes.status === 400, 'Attempting duplicate disbursement returns 400 Bad Request');

  // Test Prerequisite: Attempt approving an already disbursed application
  const approveAfterDisburseRes = await fetch(`${BASE_URL}/admin/applications/${appId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  assert(approveAfterDisburseRes.status === 400, 'Attempting to approve an already disbursed loan returns 400 Bad Request');

  console.log(`\n=== ADMIN WORKFLOW TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed === 0 ? 0 : 1);
}

testAdminWorkflow().catch(console.error);
