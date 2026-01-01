import { apiPost, apiGet } from '../axios';
import {
  IncomeTaxInput,
  IncomeTaxResult,
  GSTInput,
  GSTResult,
  EMIInput,
  EMIResult,
  HRAInput,
  HRAResult,
  TDSInput,
  TDSResult,
} from '../types';

/**
 * Calculator API Service
 */
export const calculatorService = {
  /**
   * Calculate Income Tax
   */
  calculateIncomeTax: async (input: IncomeTaxInput): Promise<IncomeTaxResult> => {
    const response = await apiPost<IncomeTaxResult>('/calculators/income-tax', input);
    return response.data;
  },

  /**
   * Calculate GST
   */
  calculateGST: async (input: GSTInput): Promise<GSTResult> => {
    const response = await apiPost<GSTResult>('/calculators/gst', input);
    return response.data;
  },

  /**
   * Calculate EMI
   */
  calculateEMI: async (input: EMIInput): Promise<EMIResult> => {
    const response = await apiPost<EMIResult>('/calculators/emi', input);
    return response.data;
  },

  /**
   * Calculate HRA
   */
  calculateHRA: async (input: HRAInput): Promise<HRAResult> => {
    const response = await apiPost<HRAResult>('/calculators/hra', input);
    return response.data;
  },

  /**
   * Calculate TDS
   */
  calculateTDS: async (input: TDSInput): Promise<TDSResult> => {
    const response = await apiPost<TDSResult>('/calculators/tds', input);
    return response.data;
  },

  /**
   * Get calculation history (for authenticated users)
   */
  getHistory: async (): Promise<any[]> => {
    try {
      const response = await apiGet<any[]>('/calculators/history');
      return response.data || [];
    } catch (error) {
      return [];
    }
  },
};

