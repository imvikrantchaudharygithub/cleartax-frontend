export interface HRAInput {
  basicSalary: number;
  da: number;
  hraReceived: number;
  cityType: 'metro' | 'non-metro';
  rentPaid: number;
  spouseIncome?: number;
}

export interface HRAResult {
  basicPlusDA: number;
  actualHRA: number;
  hraExemption: number;
  taxableHRA: number;
  monthlyTaxSaving: number;
  annualTaxSaving: number;
  effectiveHRA: number;
  breakdown: {
    actualHRA: number;
    rentMinusTenPercent: number;
    fiftyOrFortyPercent: number;
  };
}

export function calculateHRA(input: HRAInput): HRAResult {
  const basicPlusDA = input.basicSalary + input.da;
  const actualHRA = input.hraReceived;

  // HRA Exemption is the minimum of:
  // 1. Actual HRA received
  // 2. Rent paid minus 10% of (Basic + DA)
  // 3. 50% of (Basic + DA) for metro, 40% for non-metro

  const tenPercentOfBasicDA = basicPlusDA * 0.1;
  const rentMinusTenPercent = Math.max(0, input.rentPaid - tenPercentOfBasicDA);

  const metroPercentage = input.cityType === 'metro' ? 0.5 : 0.4;
  const fiftyOrFortyPercent = basicPlusDA * metroPercentage;

  const hraExemption = Math.min(
    actualHRA,
    rentMinusTenPercent,
    fiftyOrFortyPercent
  );

  const taxableHRA = actualHRA - hraExemption;

  // Assuming 30% tax bracket for HRA calculations
  const taxRate = 0.30;
  const annualTaxSaving = hraExemption * taxRate;
  const monthlyTaxSaving = annualTaxSaving / 12;

  const effectiveHRA = hraExemption / actualHRA * 100;

  return {
    basicPlusDA,
    actualHRA,
    hraExemption,
    taxableHRA,
    monthlyTaxSaving,
    annualTaxSaving,
    effectiveHRA,
    breakdown: {
      actualHRA,
      rentMinusTenPercent,
      fiftyOrFortyPercent,
    },
  };
}

