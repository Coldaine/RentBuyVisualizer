import { Assumptions } from './types';

export const calculateFinancials = (data: Assumptions) => {
  // 1. Current Loan Status
  // Derived from purchase price for this demo, assuming standard amortization curve
  const originalLoanAmount = data.purchasePrice * (1 - data.downPaymentPercent / 100);
  const monthlyRate = data.interestRate / 100 / 12;
  const numPayments = data.loanTermYears * 12;

  // Mortgage PMT
  let monthlyPI = 0;
  if (monthlyRate > 0) {
    monthlyPI = originalLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  } else {
    monthlyPI = originalLoanAmount / numPayments;
  }

  // Expenses
  const vacancyCost = data.monthlyRent * (data.vacancyRate / 100);
  const managementCost = data.monthlyRent * (data.managementFee / 100);
  const propertyTax = (data.marketValue * (data.propertyTaxRate / 100)) / 12;
  const insurance = (data.marketValue * (data.insuranceRate / 100)) / 12;
  const maintenance = (data.marketValue * (data.maintenanceRate / 100)) / 12;

  const totalOperatingExpenses = vacancyCost + managementCost + propertyTax + insurance + maintenance;

  // Cash Flow Components
  const interestPayment = originalLoanAmount * monthlyRate; // First month snapshot
  const principalPayment = monthlyPI - interestPayment;
  const monthlyCashFlow = data.monthlyRent - totalOperatingExpenses - monthlyPI;

  // Equity Return Components
  const monthlyAppreciation = (data.marketValue * (data.appreciationRate / 100)) / 12;

  // Taxable Income (Paper P&L)
  const depreciationBasis = data.purchasePrice * (data.buildingValuePercent / 100);
  const annualDepreciation = depreciationBasis / 27.5;
  const monthlyDepreciation = annualDepreciation / 12;
  const taxableIncome = data.monthlyRent - totalOperatingExpenses - interestPayment - monthlyDepreciation;

  // Tax Liability (Monthly)
  // If Taxable Income > 0, you owe taxes.
  // If Taxable Income < 0, it's a "loss" (0 tax for this specific asset silo, usually).
  const monthlyTaxLiability = taxableIncome > 0 
    ? taxableIncome * (data.marginalTaxRate / 100) 
    : 0;

  // Net Pocket Cash (After Tax)
  const afterTaxCashFlow = monthlyCashFlow - monthlyTaxLiability;

  // Total Economic Benefit (Wealth Generation - After Tax)
  // We include Appreciation here (Pre-Tax) as it is unrealized equity. 
  // We use After-Tax Cash Flow to show the "Real" benefit.
  const totalMonthlyReturn = afterTaxCashFlow + principalPayment + monthlyAppreciation;

  // --- COMPARISON BASIS: NET EQUITY ---
  // If we sell, this is the pile of cash we actually have to invest.
  const sellingCosts = data.marketValue * (data.sellingCostPercent / 100);
  const grossEquity = data.marketValue - originalLoanAmount;
  const netProceeds = Math.max(0, grossEquity - sellingCosts);

  // Return on Equity (ROE) for the Rental
  // Annual Benefit / Net Cash Available if Sold
  const rentalROE = (totalMonthlyReturn * 12) / (netProceeds || 1) * 100;

  // Stock Scenario
  const monthlyStockReturn = (netProceeds * (data.stockReturnRate / 100)) / 12;
  const stockROE = data.stockReturnRate; 
  
  // Bond Scenario
  const monthlyBondReturn = (netProceeds * (data.bondYieldRate / 100)) / 12;
  const bondROE = data.bondYieldRate;

  // Metrics
  const leverageRatio = data.marketValue / (netProceeds || 1); 
  
  // Tax Shield Calculation
  // What % of the positive cash flow is shielded by depreciation?
  const taxShieldPercentage = monthlyCashFlow > 0 
    ? Math.min(100, (monthlyDepreciation / monthlyCashFlow) * 100) 
    : 0;

  return {
    // Rental Specifics
    loanAmount: originalLoanAmount,
    monthlyPI,
    totalOperatingExpenses,
    interestPayment,
    principalPayment,
    monthlyCashFlow,
    monthlyDepreciation,
    annualDepreciation,
    taxableIncome,
    monthlyTaxLiability,
    afterTaxCashFlow,
    monthlyAppreciation,
    totalMonthlyReturn,
    rentalROE,
    taxShieldPercentage,
    
    // Comparison Data
    netProceeds,
    sellingCosts,
    monthlyStockReturn,
    stockROE,
    monthlyBondReturn,
    bondROE,
    leverageRatio
  };
};

export const formatCurrency = (val: number, minimumFractionDigits = 0) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, minimumFractionDigits }).format(val);
};

export const formatPercent = (val: number) => {
  return `${val.toFixed(2)}%`;
};