// services/eligibilityService.js

export const ELIGIBILITY_CONFIG = {
  creditScore: {
    excellent: 750,
    good: 700,
    fair: 650
  },
  dti: {
    acceptable: 30, // <= 30
    moderate: 40,   // <= 40
    high: 50        // <= 50
  },
  maxLoanIncomeMultiple: 20
};

export const calculateEligibility = ({ monthlyIncome, requestedLoanAmount, creditScore, monthlyDebt }) => {
  const reasons = [];
  let status = 'ELIGIBLE'; // Assume eligible until proven otherwise
  let creditRating = 'Poor';
  let applicableInterestRate = 14.5; // Default annual interest rate %

  // 1. DTI Calculation
  const dti = monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 100;
  
  // 2. Evaluate Credit Score & determine interest rate
  if (creditScore >= ELIGIBILITY_CONFIG.creditScore.excellent) {
    creditRating = 'Excellent';
    applicableInterestRate = 10.5; // Premium rate
    reasons.push('Excellent credit score (CIBIL 750+)');
  } else if (creditScore >= ELIGIBILITY_CONFIG.creditScore.good) {
    creditRating = 'Good';
    applicableInterestRate = 12.5;
    reasons.push('Good credit score (CIBIL 700-749)');
    status = status === 'ELIGIBLE' ? 'PARTIALLY_ELIGIBLE' : status;
  } else if (creditScore >= ELIGIBILITY_CONFIG.creditScore.fair) {
    creditRating = 'Fair';
    applicableInterestRate = 15.0;
    reasons.push('Credit score is acceptable but not excellent (CIBIL 650-699)');
    status = 'PARTIALLY_ELIGIBLE';
  } else {
    creditRating = 'Poor';
    applicableInterestRate = 18.0;
    reasons.push('Credit score is below the minimum recommended range');
    status = 'NOT_ELIGIBLE';
  }

  // 3. Evaluate DTI
  if (dti <= ELIGIBILITY_CONFIG.dti.acceptable) {
    reasons.push('Debt-to-income ratio is within acceptable range (<= 30%)');
  } else if (dti <= ELIGIBILITY_CONFIG.dti.moderate) {
    reasons.push('Debt-to-income ratio is moderate (30% - 40%)');
    status = status === 'ELIGIBLE' ? 'PARTIALLY_ELIGIBLE' : status;
  } else if (dti <= ELIGIBILITY_CONFIG.dti.high) {
    reasons.push('Debt-to-income ratio is relatively high (40% - 50%)');
    status = 'PARTIALLY_ELIGIBLE';
  } else {
    reasons.push('Debt-to-income ratio is too high (> 50%)');
    status = 'NOT_ELIGIBLE';
  }

  // 4. Evaluate Loan Amount vs Income & Max Eligible Limit
  const maxEligibleAmount = Math.max(50000, Math.min(2500000, Math.round(monthlyIncome * ELIGIBILITY_CONFIG.maxLoanIncomeMultiple)));
  if (requestedLoanAmount <= maxEligibleAmount) {
    reasons.push(`Requested loan amount is within pre-approved limit of ₹${maxEligibleAmount.toLocaleString('en-IN')}`);
  } else {
    reasons.push(`Requested loan amount exceeds calculated maximum limit of ₹${maxEligibleAmount.toLocaleString('en-IN')}`);
    if (status !== 'NOT_ELIGIBLE') {
      status = 'PARTIALLY_ELIGIBLE';
    }
  }

  return {
    status,
    creditRating,
    dti: parseFloat(dti.toFixed(2)),
    applicableInterestRate,
    maxEligibleAmount,
    reasons
  };
};

