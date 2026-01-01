export type ViewMode = 'rent' | 'stock' | 'bond';

export interface Assumptions {
  // Property
  purchasePrice: number;
  marketValue: number; // Current value if different from purchase
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  monthlyRent: number;
  
  // Expenses
  vacancyRate: number; // %
  managementFee: number; // %
  maintenanceRate: number; // % of price per year
  propertyTaxRate: number; // % of price per year
  insuranceRate: number; // % of price per year
  
  // Tax & Growth
  appreciationRate: number; // %
  buildingValuePercent: number; // % (for depreciation)
  marginalTaxRate: number; // %
  capitalGainsRate: number; // %

  // Market Comparisons (The "Alternative")
  stockReturnRate: number; // %
  bondYieldRate: number; // %
  sellingCostPercent: number; // % (Agent fees, closing costs to unlock equity)

  // ARM Specifics
  isARM: boolean;
  armFixedPeriod: number; // Years
  armIndex: number; // %
  armMargin: number; // %
  armPeriodicCap: number; // %
  armLifetimeCap: number; // %
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  purchasePrice: 450000,
  marketValue: 520000, // Appreciated value
  downPaymentPercent: 20,
  interestRate: 3.25, // Low legacy rate example
  loanTermYears: 30,
  monthlyRent: 3200,
  
  vacancyRate: 5,
  managementFee: 8,
  maintenanceRate: 1,
  propertyTaxRate: 1.2,
  insuranceRate: 0.5,
  
  appreciationRate: 2.0, // Conservative estimate
  buildingValuePercent: 80,
  marginalTaxRate: 32,
  capitalGainsRate: 15,

  stockReturnRate: 8,
  bondYieldRate: 4.5,
  sellingCostPercent: 6, // 5-6% for agents + transfer tax

  isARM: false,
  armFixedPeriod: 5,
  armIndex: 4.5,
  armMargin: 2.25,
  armPeriodicCap: 2,
  armLifetimeCap: 5,
};