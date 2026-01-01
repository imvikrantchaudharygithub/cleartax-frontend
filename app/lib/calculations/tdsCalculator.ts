export interface TDSInput {
  tdsType: 'salary' | 'professional' | 'contract' | 'rent' | 'commission' | 'interest' | 'dividend';
  amount: number;
  hasPAN: boolean;
  financialYear: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  specialCategory?: boolean;
}

export interface TDSResult {
  paymentAmount: number;
  tdsRate: number;
  tdsAmount: number;
  netAmount: number;
  effectiveRate: number;
  thresholdInfo: {
    limit: number;
    exceeded: boolean;
  };
  quarterlyBreakdown: {
    quarter: string;
    amount: number;
    tds: number;
  }[];
}

// TDS Rates for FY 2023-24
const TDS_RATES: Record<string, { withPAN: number; withoutPAN: number; threshold: number }> = {
  salary: { withPAN: 0, withoutPAN: 0, threshold: 250000 }, // Variable based on tax slab
  professional: { withPAN: 10, withoutPAN: 20, threshold: 30000 },
  contract: { withPAN: 2, withoutPAN: 20, threshold: 30000 },
  rent: { withPAN: 10, withoutPAN: 20, threshold: 240000 },
  commission: { withPAN: 5, withoutPAN: 20, threshold: 15000 },
  interest: { withPAN: 10, withoutPAN: 20, threshold: 40000 },
  dividend: { withPAN: 10, withoutPAN: 20, threshold: 5000 },
};

export function calculateTDS(input: TDSInput): TDSResult {
  const rateInfo = TDS_RATES[input.tdsType];
  
  let tdsRate = input.hasPAN ? rateInfo.withPAN : rateInfo.withoutPAN;
  
  // Special category (senior citizens, etc.) may have different rates
  if (input.specialCategory && input.tdsType === 'interest') {
    tdsRate = input.hasPAN ? 0 : 20;
  }

  const tdsAmount = (input.amount * tdsRate) / 100;
  const netAmount = input.amount - tdsAmount;
  const effectiveRate = tdsRate;

  // Threshold information
  const thresholdInfo = {
    limit: rateInfo.threshold,
    exceeded: input.amount > rateInfo.threshold,
  };

  // Quarterly breakdown (assuming equal distribution)
  const quarterlyBreakdown = [
    { quarter: 'Q1 (Apr-Jun)', amount: input.amount / 4, tds: tdsAmount / 4 },
    { quarter: 'Q2 (Jul-Sep)', amount: input.amount / 4, tds: tdsAmount / 4 },
    { quarter: 'Q3 (Oct-Dec)', amount: input.amount / 4, tds: tdsAmount / 4 },
    { quarter: 'Q4 (Jan-Mar)', amount: input.amount / 4, tds: tdsAmount / 4 },
  ];

  return {
    paymentAmount: input.amount,
    tdsRate,
    tdsAmount: Math.round(tdsAmount),
    netAmount: Math.round(netAmount),
    effectiveRate,
    thresholdInfo,
    quarterlyBreakdown,
  };
}

