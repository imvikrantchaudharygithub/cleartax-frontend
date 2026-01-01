export interface GSTInput {
  calculationType: 'add' | 'remove';
  amount: number;
  gstRate: 5 | 12 | 18 | 28;
  transactionType: 'b2b' | 'b2c';
  interstate: boolean;
}

export interface GSTResult {
  originalAmount: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  effectiveRate: number;
}

export function calculateGST(input: GSTInput): GSTResult {
  let originalAmount: number;
  let gstAmount: number;
  let totalAmount: number;

  if (input.calculationType === 'add') {
    // Add GST to the amount
    originalAmount = input.amount;
    gstAmount = (input.amount * input.gstRate) / 100;
    totalAmount = originalAmount + gstAmount;
  } else {
    // Remove GST from the amount (amount includes GST)
    totalAmount = input.amount;
    originalAmount = (input.amount * 100) / (100 + input.gstRate);
    gstAmount = totalAmount - originalAmount;
  }

  // Calculate tax distribution
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (input.interstate) {
    // Interstate transaction - IGST applies
    igst = gstAmount;
  } else {
    // Intrastate transaction - CGST + SGST applies
    cgst = gstAmount / 2;
    sgst = gstAmount / 2;
  }

  const effectiveRate = (gstAmount / originalAmount) * 100;

  return {
    originalAmount,
    gstAmount,
    cgst,
    sgst,
    igst,
    totalAmount,
    effectiveRate,
  };
}

