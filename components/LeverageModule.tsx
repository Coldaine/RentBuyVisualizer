import React, { useState } from 'react';
import { Assumptions } from '../types';
import { formatCurrency, formatPercent } from '../utils';
import { TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Lock, ArrowRight, Home, DollarSign } from 'lucide-react';

export const LeverageModule: React.FC<{ data: Assumptions }> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // CONSTANTS FOR MARKET COMPARISON
  const MARKET_RATE = 7.12; // Current benchmark 30yr fixed
  
  // 1. Calculate Payments
  // "My Loan" is based on the original loan amount logic from utils
  const loanAmount = data.purchasePrice * (1 - data.downPaymentPercent/100);
  
  const calculatePI = (principal: number, rate: number) => {
    if (rate === 0) return principal / 360;
    const r = rate / 100 / 12;
    const n = 30 * 12; // Assuming 30 year comparison for apples-to-apples
    return principal * (r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);
  };

  const myMonthlyPI = calculatePI(loanAmount, data.interestRate);
  const marketMonthlyPI = calculatePI(loanAmount, MARKET_RATE);
  const monthlySavings = marketMonthlyPI - myMonthlyPI;
  const annualSavings = monthlySavings * 12;
  const tenYearValue = annualSavings * 10;

  // 2. Calculate Purchasing Power Erosion
  // How much loan can I get TODAY for 'myMonthlyPI' at 'MARKET_RATE'?
  const calculateAffordablePrincipal = (payment: number, rate: number) => {
    const r = rate / 100 / 12;
    const n = 30 * 12;
    return payment * (Math.pow(1+r, n) - 1) / (r * Math.pow(1+r, n));
  };

  const affordableLoanToday = calculateAffordablePrincipal(myMonthlyPI, MARKET_RATE);
  const purchasingPowerLoss = loanAmount - affordableLoanToday;
  const purchasingPowerRatio = affordableLoanToday / loanAmount;

  return (
    <div className="bg-slate-900 border border-indigo-900/50 rounded-xl transition-all duration-300 shadow-xl overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-indigo-950/20 cursor-pointer select-none group border-b border-indigo-900/30"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
             <Lock size={20} />
           </div>
           <div>
             <h3 className="font-bold text-slate-100">The "Golden Handcuffs" Analysis</h3>
             <p className="text-xs text-indigo-400">Why your {formatPercent(data.interestRate)} rate is an invisible asset</p>
           </div>
        </div>
        <button className="text-slate-500 group-hover:text-white transition-colors">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* VISUAL 1: THE PAYMENT GAP */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                   <DollarSign size={14}/> The Cost to Replicate
                 </h4>
                 <p className="text-xs text-slate-500">
                   If you bought your house today with a {formatPercent(MARKET_RATE)} loan, here is the monthly difference.
                 </p>

                 <div className="flex items-end justify-center gap-6 h-48 pt-4 pb-2 border-b border-slate-800">
                    {/* Bar 1: My Payment */}
                    <div className="flex flex-col items-center gap-2 group w-24">
                       <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/50">
                         {formatCurrency(myMonthlyPI)}
                       </span>
                       <div 
                         className="w-full bg-emerald-500/80 rounded-t-lg relative transition-all group-hover:bg-emerald-400"
                         style={{ height: '100px' }} // Baseline
                       >
                         <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-emerald-950 font-bold uppercase opacity-70">
                           You
                         </div>
                       </div>
                    </div>

                    {/* Bar 2: Market Payment */}
                    <div className="flex flex-col items-center gap-2 group w-24">
                       <span className="text-xs font-bold text-rose-400 bg-rose-950/50 px-2 py-1 rounded border border-rose-900/50">
                         {formatCurrency(marketMonthlyPI)}
                       </span>
                       <div 
                         className="w-full bg-slate-700 rounded-t-lg relative transition-all group-hover:bg-slate-600 flex flex-col justify-end"
                         style={{ height: `${(marketMonthlyPI / myMonthlyPI) * 100}px` }} 
                       >
                          {/* The "Waste" Segment */}
                          <div className="bg-rose-500/80 w-full rounded-t-lg absolute top-0 flex items-center justify-center" style={{ bottom: '100px' }}>
                             <div className="text-white text-xs font-bold drop-shadow-md">
                               +{formatCurrency(monthlySavings)}
                             </div>
                          </div>
                          <div className="h-[100px] w-full border-t border-dashed border-slate-500/50 absolute bottom-0 flex items-end justify-center pb-2">
                            <div className="text-[10px] text-slate-300 font-bold uppercase opacity-70">
                              Market
                            </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-center">
                    <div className="text-xs text-rose-300 mb-1">Total "Wasted" Interest Per Year</div>
                    <div className="text-xl font-bold text-rose-500 font-mono">{formatCurrency(annualSavings)}</div>
                 </div>
              </div>

              {/* VISUAL 2: THE SHRINKING HOUSE */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                   <Home size={14}/> Purchasing Power Erosion
                 </h4>
                 <p className="text-xs text-slate-500">
                   If you kept your current payment of <span className="text-emerald-400 font-bold">{formatCurrency(myMonthlyPI)}</span>, this is how much loan you could get today.
                 </p>

                 <div className="h-48 flex items-center justify-center gap-8 relative border-b border-slate-800">
                    
                    {/* Large House (Current) */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                       <Home 
                         size={80} 
                         className="text-indigo-500 drop-shadow-2xl" 
                         strokeWidth={1.5}
                       />
                       <div className="text-center">
                         <div className="text-xs text-slate-400">Current Power</div>
                         <div className="font-bold text-indigo-400">{formatCurrency(loanAmount)}</div>
                       </div>
                    </div>

                    <ArrowRight className="text-slate-600" />

                    {/* Small House (Market) */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                       <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
                         <Home 
                           size={80 * Math.max(0.4, purchasingPowerRatio)} // Scale icon size
                           className="text-slate-600" 
                           strokeWidth={1.5}
                         />
                       </div>
                       <div className="text-center">
                         <div className="text-xs text-slate-400">New Reality</div>
                         <div className="font-bold text-slate-200">{formatCurrency(affordableLoanToday)}</div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                       <span>Lost Buying Power</span>
                       <span>{formatPercent((1 - purchasingPowerRatio) * 100)} Decrease</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                       <div className="bg-rose-500 h-full" style={{ width: `${(1 - purchasingPowerRatio) * 100}%` }}></div>
                    </div>
                    <div className="text-center mt-2 font-bold text-slate-300">
                       -{formatCurrency(purchasingPowerLoss)}
                    </div>
                 </div>
              </div>

            </div>

            {/* EXPLANATION TEXT */}
            <div className="mt-8 pt-6 border-t border-slate-800">
               <h4 className="text-sm font-bold text-white mb-2">Why is this an "Asset"?</h4>
               <p className="text-sm text-slate-400 leading-relaxed">
                 You have locked in a cost of capital ({formatPercent(data.interestRate)}) that is significantly below the current market price ({formatPercent(MARKET_RATE)}). 
                 Wall Street views your mortgage as a <strong>financial asset</strong> because you are paying them less than inflation + risk would demand today. 
                 <br/><br/>
                 <span className="text-indigo-400">The moment you sell this house, this asset is destroyed.</span> You cannot transfer this rate to a new property or a stock portfolio. 
                 This "Shadow Equity" (the ~{formatCurrency(tenYearValue)} you save over 10 years) only exists as long as you keep the loan.
               </p>
            </div>

            {/* ARM WARNING IF APPLICABLE */}
            {data.isARM && (
              <div className="mt-6 bg-amber-950/30 border border-amber-900/50 rounded-lg p-4 flex gap-4">
                 <div className="p-2 bg-amber-500/20 text-amber-500 rounded h-fit">
                   <AlertTriangle size={20} />
                 </div>
                 <div>
                   <h5 className="font-bold text-amber-500 text-sm">ARM Risk Warning</h5>
                   <p className="text-xs text-amber-200/70 mt-1">
                     Since you have an Adjustable Rate Mortgage, this asset is temporary. Once your fixed period ends in {data.armFixedPeriod} years, your rate will likely jump to {formatPercent(data.armIndex + data.armMargin)}, destroying this specific value.
                   </p>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};