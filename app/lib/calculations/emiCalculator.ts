export interface EMIInput {
  loanAmount: number;
  interestRate: number; // Annual interest rate in percentage
  loanDuration: number; // In months
  loanType: 'home' | 'auto' | 'personal' | 'education';
  processingFee?: number;
  insurance?: number;
  prepayment?: number;
}

export interface EMIResult {
  monthlyEMI: number;
  totalAmount: number;
  totalInterest: number;
  processingFee: number;
  insuranceTotal: number;
  amortizationSchedule: {
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
  earlyPayoffScenarios?: {
    extraPayment: number;
    monthsSaved: number;
    interestSaved: number;
  }[];
}

export function calculateEMI(input: EMIInput): EMIResult {
  const principal = input.loanAmount;
  const monthlyRate = input.interestRate / 12 / 100;
  const totalMonths = input.loanDuration;

  // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const emi =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Generate amortization schedule
  const amortizationSchedule: EMIResult['amortizationSchedule'] = [];
  let balance = principal;

  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = emi - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    amortizationSchedule.push({
      month,
      emi: Math.round(emi),
      principal: Math.round(principalPayment),
      interest: Math.round(interestPayment),
      balance: Math.round(balance),
    });
  }

  const totalAmount = emi * totalMonths;
  const totalInterest = totalAmount - principal;

  // Processing fee and insurance
  const processingFee = input.processingFee || 0;
  const insuranceTotal = (input.insurance || 0) * totalMonths;

  // Early payoff scenarios
  const earlyPayoffScenarios: EMIResult['earlyPayoffScenarios'] = [];
  
  for (const extraPayment of [1000, 5000, 10000]) {
    if (extraPayment < emi) {
      const newEMI = emi + extraPayment;
      let newBalance = principal;
      let months = 0;

      while (newBalance > 0 && months < totalMonths) {
        const interest = newBalance * monthlyRate;
        const principalPaid = newEMI - interest;
        newBalance = Math.max(0, newBalance - principalPaid);
        months++;
      }

      const monthsSaved = totalMonths - months;
      const newTotalInterest = (newEMI * months) - principal;
      const interestSaved = totalInterest - newTotalInterest;

      if (monthsSaved > 0) {
        earlyPayoffScenarios.push({
          extraPayment,
          monthsSaved,
          interestSaved: Math.round(interestSaved),
        });
      }
    }
  }

  return {
    monthlyEMI: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
    processingFee: Math.round(processingFee),
    insuranceTotal: Math.round(insuranceTotal),
    amortizationSchedule,
    earlyPayoffScenarios,
  };
}

