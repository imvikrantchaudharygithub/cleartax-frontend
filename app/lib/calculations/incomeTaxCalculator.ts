export interface IncomeTaxInput {
  financialYear: string;
  incomeType: 'salary' | 'business' | 'investment' | 'other';
  grossIncome: number;
  age: number;
  deductions: {
    section80C: number;
    section80D: number;
    section80E: number;
    others: number;
  };
  state: string;
  surcharge: boolean;
}

export interface IncomeTaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBreakdown: {
    slab: string;
    rate: number;
    amount: number;
  }[];
  baseTax: number;
  cess: number;
  surcharge: number;
  totalTax: number;
  effectiveRate: number;
}

// Tax slabs for FY 2023-24 (New Regime)
const TAX_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 5 },
  { min: 600000, max: 900000, rate: 10 },
  { min: 900000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

const CESS_RATE = 0.04; // 4% Health and Education Cess

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  // Calculate total deductions (max 150,000 for 80C)
  const totalDeductions = Math.min(
    input.deductions.section80C +
      input.deductions.section80D +
      input.deductions.section80E +
      input.deductions.others,
    150000
  );

  // Apply age-based exemptions
  let exemptionLimit = 250000;
  if (input.age >= 60 && input.age < 80) {
    exemptionLimit = 300000; // Senior citizen
  } else if (input.age >= 80) {
    exemptionLimit = 500000; // Super senior citizen
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, input.grossIncome - totalDeductions - exemptionLimit);

  // Calculate tax for each slab
  const taxBreakdown: { slab: string; rate: number; amount: number }[] = [];
  let baseTax = 0;

  for (let i = 0; i < TAX_SLABS.length; i++) {
    const slab = TAX_SLABS[i];
    if (taxableIncome > slab.min) {
      const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
      const taxAmount = (taxableInSlab * slab.rate) / 100;

      if (taxAmount > 0) {
        taxBreakdown.push({
          slab: `₹${slab.min.toLocaleString('en-IN')} - ${
            slab.max === Infinity ? 'Above' : '₹' + slab.max.toLocaleString('en-IN')
          }`,
          rate: slab.rate,
          amount: taxAmount,
        });
        baseTax += taxAmount;
      }
    }
  }

  // Calculate surcharge (for income above ₹50 lakhs)
  let surchargeAmount = 0;
  if (input.surcharge && input.grossIncome > 5000000) {
    if (input.grossIncome > 10000000) {
      surchargeAmount = baseTax * 0.15; // 15% surcharge
    } else {
      surchargeAmount = baseTax * 0.10; // 10% surcharge
    }
  }

  // Calculate cess
  const cess = (baseTax + surchargeAmount) * CESS_RATE;

  // Total tax
  const totalTax = baseTax + surchargeAmount + cess;

  // Effective tax rate
  const effectiveRate = input.grossIncome > 0 ? (totalTax / input.grossIncome) * 100 : 0;

  return {
    grossIncome: input.grossIncome,
    totalDeductions,
    taxableIncome,
    taxBreakdown,
    baseTax,
    cess,
    surcharge: surchargeAmount,
    totalTax,
    effectiveRate,
  };
}

