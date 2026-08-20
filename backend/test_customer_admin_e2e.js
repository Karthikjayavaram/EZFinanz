import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api';

async function runFullCustomerAdminE2E() {
  console.log('====================================================');
  console.log('STARTING COMPLETE CUSTOMER <-> ADMIN E2E INTEGRATION SUITE');
  console.log('====================================================');

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

  // --- 1. ADMIN AUTHENTICATION ---
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ezfinanz.com', password: 'Admin@123456' })
  });
  const adminLoginData = await adminLoginRes.json();
  assert(adminLoginRes.status === 200, 'Admin login succeeds with 200 OK');
  assert(adminLoginData.data?.role === 'ADMIN', 'Admin role verified in token');
  const adminToken = adminLoginData.data?.token;

  // --- 2. CUSTOMER SIGNUP & INITIALIZATION ---
  const custEmail = `rahul_verma_${Date.now()}@example.com`;
  const custSignupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rahul Verma',
      email: custEmail,
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: 'SecurePassword@123'
    })
  });
  const custSignupData = await custSignupRes.json();
  assert(custSignupRes.status === 201, 'Customer signup succeeds with 201 Created');
  assert(custSignupData.data?.role === 'CUSTOMER', 'Customer role is enforced as CUSTOMER');
  const customerToken = custSignupData.data?.token;
  const customerId = custSignupData.data?._id;

  // Email & Phone Verification flags check
  assert(typeof custSignupData.data?.emailVerified === 'boolean', 'Email verification status is tracked');
  assert(typeof custSignupData.data?.phoneVerified === 'boolean', 'Phone verification status is tracked');

  // Fetch /applications/me to initialize application
  const meRes = await fetch(`${BASE_URL}/applications/me`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const meData = await meRes.json();
  const appId = meData.data?._id;
  assert(meRes.status === 200, `Loan application created: #${meData.data?.applicationNumber}`);
  assert(meData.data?.userId === customerId, 'Application userId matches authenticated customer');

  // --- 3. APPLICATION OWNERSHIP SECURITY TEST (Customer B vs Customer A) ---
  const custBRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Attacker Customer',
      email: `attacker_${Date.now()}@example.com`,
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: 'AttackerPassword@123'
    })
  });
  const custBData = await custBRes.json();
  const attackerToken = custBData.data?.token;

  // Attacker attempts modifying Customer A's application
  const crossUserKycRes = await fetch(`${BASE_URL}/applications/${appId}/kyc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${attackerToken}` },
    body: JSON.stringify({ fullName: 'Malicious Attacker', idType: 'PAN', idNumber: 'HACK00000X' })
  });
  assert(crossUserKycRes.status === 404, 'Cross-customer data access rejected with 404 (Application Ownership Secure)');

  // Customer attempts calling Admin API
  const customerCallingAdminRes = await fetch(`${BASE_URL}/admin/applications`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  assert(customerCallingAdminRes.status === 403, 'Customer accessing Admin endpoint rejected with 403 Forbidden');

  // --- 4. STEP-BY-STEP CUSTOMER JOURNEY (DATABASE CONTINUITY) ---

  // A. KYC Submission
  const kycRes = await fetch(`${BASE_URL}/applications/${appId}/kyc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      fullName: 'Rahul Verma',
      dob: '1992-08-20',
      gender: 'MALE',
      address: '404 Tech Park Avenue, HSR Layout, Bengaluru, Karnataka 560102',
      idType: 'PAN',
      idNumber: 'ABCDE1234F',
      idDocumentUrl: 'https://res.cloudinary.com/demo/image/upload/sample_pan.jpg'
    })
  });
  const kycData = await kycRes.json();
  assert(kycRes.status === 200, 'KYC submitted successfully');
  assert(kycData.data?._id === appId, 'KYC updated on same application document');
  assert(kycData.data?.currentStage === 'KYC_COMPLETED', 'Stage transitioned to KYC_COMPLETED');

  // B. Eligibility Check
  const eligRes = await fetch(`${BASE_URL}/applications/${appId}/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      incomeType: 'MONTHLY',
      monthlyIncome: 120000,
      requestedLoanAmount: 500000,
      creditScore: 790,
      monthlyDebt: 15000,
      employerName: 'Google India Pvt Ltd',
      designation: 'Senior Staff Engineer'
    })
  });
  const eligData = await eligRes.json();
  assert(eligRes.status === 200, 'Eligibility assessment computed');
  assert(eligData.data?._id === appId, 'Eligibility updated on same application document');
  assert(eligData.data?.eligibility?.status === 'ELIGIBLE', 'Customer evaluated as ELIGIBLE');
  assert(eligData.data?.currentStage === 'ELIGIBILITY_COMPLETED', 'Stage transitioned to ELIGIBILITY_COMPLETED');

  // C. Loan & EMI Terms Selection
  const loanRes = await fetch(`${BASE_URL}/applications/${appId}/loan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      amount: 500000,
      tenure: 36
    })
  });
  const loanData = await loanRes.json();
  assert(loanRes.status === 200, 'Loan & EMI terms calculated and selected');
  assert(loanData.data?.loanDetails?.amount === 500000, 'Loan amount matches 500,000');
  assert(loanData.data?.loanDetails?.tenure === 36, 'Tenure matches 36 Months');
  assert(loanData.data?.loanDetails?.emi > 0, `Monthly EMI computed: ₹${loanData.data?.loanDetails?.emi}`);
  assert(loanData.data?.currentStage === 'EMI_SELECTED', 'Stage transitioned to EMI_SELECTED');

  // D. Bank Account Linking
  const bankRes = await fetch(`${BASE_URL}/applications/${appId}/bank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      accountHolderName: 'Rahul Verma',
      bankName: 'ICICI Bank',
      accountNumber: '000401567890',
      ifsc: 'ICIC0000004',
      accountType: 'SAVINGS',
      branchName: 'Koramangala Branch'
    })
  });
  const bankData = await bankRes.json();
  assert(bankRes.status === 200, 'Bank account linked and verified');
  assert(bankData.data?.bankAccount?.bankName === 'ICICI Bank', 'Bank name verified');
  assert(bankData.data?.currentStage === 'BANK_ACCOUNT_ADDED', 'Stage transitioned to BANK_ACCOUNT_ADDED');

  // E. Legal Declaration Acceptance
  const declRes = await fetch(`${BASE_URL}/applications/${appId}/declaration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      accepted: true,
      version: 'KFS-v2026.1'
    })
  });
  const declData = await declRes.json();
  assert(declRes.status === 200, 'Legal declaration accepted');
  assert(declData.data?.declaration?.accepted === true, 'Declaration accepted flag is true');
  assert(declData.data?.currentStage === 'DECLARATION_ACCEPTED', 'Stage transitioned to DECLARATION_ACCEPTED');

  // F. Initial Selfie Submission
  const selfie1Res = await fetch(`${BASE_URL}/applications/${appId}/selfie`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      url: 'data:image/jpeg;base64,sample_blurry_selfie_data',
      publicId: 'selfie_blurry_1'
    })
  });
  const selfie1Data = await selfie1Res.json();
  assert(selfie1Res.status === 200, 'Initial selfie submitted');
  assert(selfie1Data.data?.currentStage === 'WAITING_FOR_ADMIN', 'Stage moved to WAITING_FOR_ADMIN');
  assert(selfie1Data.data?.status === 'PENDING', 'Status moved to PENDING');

  // --- 5. ADMIN VISIBILITY & REJECTION/RESUBMISSION WORKFLOW ---

  // Admin gets application list
  const adminListRes = await fetch(`${BASE_URL}/admin/applications`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminListData = await adminListRes.json();
  assert(adminListRes.status === 200, 'Admin sees application in queue');
  const foundInQueue = adminListData.data.find(a => a._id === appId);
  assert(!!foundInQueue, 'Application discovered in admin queue');

  // Admin inspects application detail
  const adminDetailRes = await fetch(`${BASE_URL}/admin/applications/${appId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminDetailData = await adminDetailRes.json();
  assert(adminDetailRes.status === 200, 'Admin fetches complete application detail');
  assert(adminDetailData.data?.kyc?.fullName === 'Rahul Verma', 'Admin sees matching KYC full name');
  assert(adminDetailData.data?.bankAccount?.accountNumber === '000401567890', 'Admin sees matching bank account');

  // Admin rejects initial selfie because it is blurry
  const selfieRejectRes = await fetch(`${BASE_URL}/admin/applications/${appId}/selfie-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'REJECTED',
      reason: 'Photo is blurry and lighting is insufficient'
    })
  });
  const selfieRejectData = await selfieRejectRes.json();
  assert(selfieRejectRes.status === 200, 'Admin successfully rejects selfie with reason');
  assert(selfieRejectData.data?.adminReview?.selfieStatus === 'REJECTED', 'Selfie status updated to REJECTED');
  assert(selfieRejectData.data?.currentStage === 'SELFIE_REJECTED', 'Stage transitioned to SELFIE_REJECTED');

  // Customer checks dashboard and sees rejection reason
  const custCheckRes1 = await fetch(`${BASE_URL}/applications/me`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const custCheckData1 = await custCheckRes1.json();
  assert(custCheckData1.data?.currentStage === 'SELFIE_REJECTED', 'Customer dashboard receives SELFIE_REJECTED stage');
  assert(
    custCheckData1.data?.adminReview?.selfieRejectionReason === 'Photo is blurry and lighting is insufficient',
    'Customer sees exact rejection reason provided by admin'
  );

  // Customer resubmits clearer selfie
  const selfie2Res = await fetch(`${BASE_URL}/applications/${appId}/selfie`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
    body: JSON.stringify({
      url: 'data:image/jpeg;base64,sample_hd_clear_selfie_data',
      publicId: 'selfie_hd_2'
    })
  });
  const selfie2Data = await selfie2Res.json();
  assert(selfie2Res.status === 200, 'Customer resubmitted updated clear selfie');
  assert(selfie2Data.data?.currentStage === 'WAITING_FOR_ADMIN', 'Stage returned to WAITING_FOR_ADMIN');
  assert(selfie2Data.data?.selfie?.url.includes('sample_hd_clear_selfie_data'), 'New selfie URL replaced old photo');

  // Admin approves new selfie
  const selfieApproveRes = await fetch(`${BASE_URL}/admin/applications/${appId}/selfie-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'APPROVED' })
  });
  const selfieApproveData = await selfieApproveRes.json();
  assert(selfieApproveRes.status === 200, 'Admin approves new selfie');
  assert(selfieApproveData.data?.adminReview?.selfieStatus === 'APPROVED', 'Selfie status updated to APPROVED');

  // --- 6. ADMIN APPLICATION APPROVAL ---
  const approveAppRes = await fetch(`${BASE_URL}/admin/applications/${appId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  const approveAppData = await approveAppRes.json();
  assert(approveAppRes.status === 200, 'Admin sanctions and approves loan application');
  assert(approveAppData.data?.status === 'APPROVED', 'Application status updated to APPROVED');
  assert(approveAppData.data?.currentStage === 'APPLICATION_APPROVED', 'Current stage updated to APPLICATION_APPROVED');

  // Customer checks dashboard and sees APPROVED status
  const custCheckRes2 = await fetch(`${BASE_URL}/applications/me`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const custCheckData2 = await custCheckRes2.json();
  assert(custCheckData2.data?.status === 'APPROVED', 'Customer dashboard immediately reflects APPROVED status');

  // --- 7. ADMIN SIMULATED DISBURSEMENT ---
  const disburseRes = await fetch(`${BASE_URL}/admin/applications/${appId}/disburse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  });
  const disburseData = await disburseRes.json();
  assert(disburseRes.status === 200, 'Admin confirms simulated loan disbursement');
  assert(disburseData.data?.status === 'DISBURSED', 'Application status updated to DISBURSED');
  assert(disburseData.data?.currentStage === 'DISBURSEMENT_CONFIRMED', 'Current stage updated to DISBURSEMENT_CONFIRMED');
  const disbRef = disburseData.data?.disbursementReference;
  assert(!!disbRef && disbRef.startsWith('EZFDISB-'), `Disbursement reference generated: ${disbRef}`);

  // Customer checks dashboard and sees DISBURSED status + reference + bank details
  const custCheckRes3 = await fetch(`${BASE_URL}/applications/me`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const custCheckData3 = await custCheckRes3.json();
  assert(custCheckData3.data?.status === 'DISBURSED', 'Customer dashboard reflects final DISBURSED status');
  assert(custCheckData3.data?.disbursementReference === disbRef, 'Customer receives matching disbursement reference');
  assert(!!custCheckData3.data?.disbursedAt, 'Customer receives disbursement timestamp');
  assert(custCheckData3.data?.loanDetails?.netDisbursement > 0, 'Customer receives net disbursement amount');

  console.log('====================================================');
  console.log(`CUSTOMER <-> ADMIN E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed === 0 ? 0 : 1);
}

runFullCustomerAdminE2E().catch(console.error);
