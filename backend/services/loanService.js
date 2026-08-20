const calculateIRR = (cashFlows) => {
  // Simple IRR approximation using binary search / bisection
  let min = 0.0;
  let max = 1.0;
  let guess = 0.1;
  const maxIterations = 1000;
  let currentIteration = 0;
  const precision = 0.00001;

  while (currentIteration < maxIterations) {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + guess, i);
    }
    
    if (Math.abs(npv) < precision) {
      return guess * 12 * 100; // Annualized percentage
    }
    
    if (npv > 0) {
      // increase rate
      min = guess;
      guess = (guess + max) / 2;
    } else {
      // decrease rate
      max = guess;
      guess = (min + guess) / 2;
    }
    currentIteration++;
  }
  return guess * 12 * 100;
};

export const generateAmortizationSchedule = (principal, tenureMonths, annualInterestRate, emi) => {
  const monthlyRate = annualInterestRate / 12 / 100;
  let balance = principal;
  const schedule = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate;
    let principalPaid = emi - interest;
    if (month === tenureMonths || balance - principalPaid < 0) {
      principalPaid = balance;
    }
    const closingBalance = Math.max(0, balance - principalPaid);

    schedule.push({
      month,
      openingBalance: Math.round(balance),
      emi: Math.round(principalPaid + interest),
      principal: Math.round(principalPaid),
      interest: Math.round(interest),
      closingBalance: Math.round(closingBalance),
    });

    balance = closingBalance;
  }

  return schedule;
};

export const calculateLoan = (principal, tenureMonths, annualInterestRate = 12) => {
  const numPrincipal = Number(principal);
  const numTenure = Number(tenureMonths);
  const numRate = Number(annualInterestRate);

  const monthlyInterestRate = numRate / 12 / 100;
  
  // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const factor = Math.pow(1 + monthlyInterestRate, numTenure);
  const emi = (numPrincipal * monthlyInterestRate * factor) / (factor - 1);
              
  const processingFee = Math.round(numPrincipal * 0.02); // 2% processing fee
  const gst = Math.round(processingFee * 0.18); // 18% GST on processing fee
  const otherCharges = 0; // Transparent zero hidden charges
  const totalCharges = processingFee + gst + otherCharges;
  const netDisbursement = numPrincipal - totalCharges;
  const totalRepayment = Math.round(emi * numTenure);
  const totalInterest = Math.round(totalRepayment - numPrincipal);

  // Cash flows for IRR: Initial disbursement (negative), followed by monthly EMIs (positive)
  const cashFlows = [-netDisbursement];
  for (let i = 0; i < numTenure; i++) {
    cashFlows.push(emi);
  }
  
  const calculatedIrr = calculateIRR(cashFlows);
  const schedule = generateAmortizationSchedule(numPrincipal, numTenure, numRate, emi);

  return {
    amount: numPrincipal,
    tenure: numTenure,
    interestRate: numRate,
    emi: Math.round(emi),
    totalInterest,
    totalRepayment,
    processingFee,
    gst,
    otherCharges,
    totalCharges,
    netDisbursement,
    irr: parseFloat(calculatedIrr.toFixed(2)),
    schedule,
  };
};

