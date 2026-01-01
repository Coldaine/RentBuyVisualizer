import React, { useState, useMemo } from 'react';
import { ViewMode, Assumptions, DEFAULT_ASSUMPTIONS } from './types';
import { calculateFinancials, formatCurrency, formatPercent } from './utils';
import { AssumptionsDrawer } from './components/AssumptionsDrawer';
import { LeverageModule } from './components/LeverageModule';
import { 
  Building2, 
  TrendingUp, 
  PiggyBank, 
  Scale, 
  ArrowRightLeft,
  BookOpen,
  Check,
  X,
  AlertTriangle,
  Zap,
  Shield,
  Clock,
  Briefcase,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowRight,
  Hammer,
  Coffee,
  Lock,
  Unlock,
  Droplets
} from 'lucide-react';

// --- DYNAMIC CONTENT ENGINE ---
type ConceptId = 'roe' | 'leverage' | 'tax' | 'cashflow' | 'liquidity' | 'inflation' | 'volatility' | 'control' | 'effort' | 'principal';

interface ComparisonRow {
  mode: ViewMode;
  label: string;
  value: string; // The "Headline" number/status
  description: string;
  isWinner: boolean; // Does this mode win on this specific metric?
  isLoser?: boolean;
}

const getConceptData = (id: ConceptId, financials: any, assumptions: Assumptions): { title: string, def: string, rows: ComparisonRow[] } => {
  const { 
    rentalROE, stockROE, bondROE, 
    leverageRatio, 
    annualDepreciation,
    sellingCosts, netProceeds
  } = financials;

  const data: Record<ConceptId, { title: string, def: string, rows: ComparisonRow[] }> = {
    roe: {
      title: "Wealth Speed (ROE)",
      def: "How fast your actual cash equity is growing per year.",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: `${formatPercent(rentalROE)}`,
          description: `Supercharged by ${leverageRatio.toFixed(1)}x leverage. You keep all the profit, but the bank put up most of the money.`,
          isWinner: rentalROE > stockROE && rentalROE > bondROE
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: `${formatPercent(stockROE)}`,
          description: "Unlevered. Your money grows at the market rate, but only on the cash you actually own.",
          isWinner: stockROE > rentalROE
        },
        {
          mode: 'bond',
          label: "Bonds/CD",
          value: `${formatPercent(bondROE)}`,
          description: "Slow and steady. The safe lane.",
          isWinner: false,
          isLoser: true
        }
      ]
    },
    leverage: {
      title: "The Multiplier (Leverage)",
      def: "Using the bank's money to buy a bigger asset.",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: `${leverageRatio.toFixed(1)}x Multiplier`,
          description: `If the house goes up 3%, your equity goes up ~${(3 * leverageRatio).toFixed(1)}% because you hold the whole asset.`,
          isWinner: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "1.0x (None)",
          description: "If the stock market goes up 3%, you make 3%.",
          isWinner: false
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "1.0x (None)",
          description: "No multiplier.",
          isWinner: false
        }
      ]
    },
    tax: {
      title: "Tax Shield efficiency",
      def: "How much of your profit does the IRS take?",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: "High Shield",
          description: `Depreciation is a 'fake expense' that hides real income from taxes.`,
          isWinner: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "Tax Deferred",
          description: "You don't pay tax on growth until you sell. Dividends are taxed now.",
          isWinner: false
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "Fully Taxed",
          description: `Interest is taxed as regular income at ~${assumptions.marginalTaxRate}%.`,
          isWinner: false,
          isLoser: true
        }
      ]
    },
    cashflow: {
      title: "Cash Flow Stability",
      def: "Can you count on this money every month?",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: "Volatile",
          description: "One broken HVAC ($8k) or bad tenant wipes out a year of cash flow.",
          isWinner: false,
          isLoser: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "Low Yield",
          description: "Dividends are tiny. To get cash, you must sell shares (cannibalize the asset).",
          isWinner: false
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "Guaranteed",
          description: "Contractual payouts. The most reliable income stream.",
          isWinner: true
        }
      ]
    },
    liquidity: {
      title: "Liquidity (Access to Cash)",
      def: "If you have an emergency, how fast can you get your money?",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: "Locked Up",
          description: "Takes 60+ days to sell. Costly to access.",
          isWinner: false,
          isLoser: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "Instant",
          description: "Click a button, cash in 2 days.",
          isWinner: true
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "High",
          description: "Easy to sell liquid treasuries.",
          isWinner: true
        }
      ]
    },
    inflation: {
      title: "Inflation Protection",
      def: "Does it keep up when everything gets expensive?",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: "The 'Double Hedge'",
          description: "Home values rise with inflation, AND your fixed debt payment effectively gets 'cheaper'.",
          isWinner: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "Good",
          description: "Companies raise prices to match inflation, protecting your purchasing power.",
          isWinner: true
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "Destroyed",
          description: "Inflation eats fixed payments alive. Your $100 buys less every year.",
          isWinner: false,
          isLoser: true
        }
      ]
    },
    volatility: {
      title: "Psychological Stress (Volatility)",
      def: "How scary is the price movement?",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: "Calm",
          description: "Prices move slowly. You don't check Zillow every hour.",
          isWinner: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "Rollercoaster",
          description: "Can drop 20% in a week. Requires strong nerves to not panic sell.",
          isWinner: false,
          isLoser: true
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "Stable",
          description: "Principal is safe if held to maturity.",
          isWinner: true
        }
      ]
    },
    control: {
      title: "Active Control",
      def: "Can you work harder to make more money?",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: "Yes (High)",
          description: "You can renovate, add a room, or manage better to increase value.",
          isWinner: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "No (Passive)",
          description: "You are a passenger. You cannot tell Apple how to design iPhones.",
          isWinner: false
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "No (Passive)",
          description: "It is just a contract.",
          isWinner: false
        }
      ]
    },
    effort: {
      title: "Lifestyle Impact",
      def: "Is this a passive investment or a job?",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: "Part-Time Job",
          description: "Tenants call at night. Things break. Taxes are complex.",
          isWinner: false,
          isLoser: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "Freedom",
          description: "True passive income. Make money while you sleep.",
          isWinner: true
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "Freedom",
          description: "Zero effort required.",
          isWinner: true
        }
      ]
    },
    principal: {
      title: "Forced Savings",
      def: "Are you saving money automatically?",
      rows: [
        {
          mode: 'rent',
          label: "Real Estate",
          value: "Automatic",
          description: "Your tenant pays your mortgage. You get richer every month by doing nothing.",
          isWinner: true
        },
        {
          mode: 'stock',
          label: "Stocks",
          value: "Manual",
          description: "You only save if you choose to transfer cash.",
          isWinner: false
        },
        {
          mode: 'bond',
          label: "Bonds",
          value: "N/A",
          description: "No principal accretion.",
          isWinner: false
        }
      ]
    }
  };
  return data[id];
};

const CONCEPT_IDS: ConceptId[] = ['roe', 'leverage', 'tax', 'cashflow', 'principal', 'liquidity', 'inflation', 'volatility', 'control', 'effort'];

// --- VISUAL COMPONENTS ---

const CollapsibleCard = ({ 
  title, 
  subtitle,
  icon: Icon, 
  children, 
  defaultOpen = true,
  className = "",
  headerClassName = "p-4",
  contentClassName = "p-4 pt-0"
}: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`transition-all duration-300 ${className}`}>
      <div 
        className={`flex items-center justify-between cursor-pointer select-none group ${headerClassName}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-indigo-400" />}
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-2">
              {title}
            </div>
            {subtitle && <div className="text-xs text-slate-400 font-normal mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <button className="text-slate-500 group-hover:text-white transition-colors">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className={contentClassName}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const MathRow = ({ label, value, operator, highlight, valueClass }: { label: string, value: string, operator?: string, highlight?: boolean, valueClass?: string }) => (
  <div className={`flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0 ${highlight ? 'bg-indigo-500/10 -mx-2 px-2 rounded' : ''}`}>
    <span className={`text-sm flex items-center gap-2 ${highlight ? 'text-indigo-200 font-semibold' : 'text-slate-400'}`}>
      {operator && <span className="font-mono text-slate-600 font-bold w-4">{operator}</span>}
      {label}
    </span>
    <span className={`text-sm font-mono ${valueClass || (highlight ? 'text-indigo-200 font-bold' : 'text-slate-200')}`}>{value}</span>
  </div>
);

const App: React.FC = () => {
  const [compareMode, setCompareMode] = useState<'stock' | 'bond'>('stock');
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [selectedConcepts, setSelectedConcepts] = useState<ConceptId[]>(['roe', 'leverage', 'tax']);

  const financials = useMemo(() => calculateFinancials(assumptions), [assumptions]);
  
  const handleAssumptionChange = (key: keyof Assumptions, value: number | boolean) => {
    setAssumptions(prev => ({ ...prev, [key]: value }));
  };

  const toggleConcept = (id: ConceptId) => {
    setSelectedConcepts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen pb-40 font-sans bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="px-6 py-6 border-b border-slate-900/50 bg-slate-950 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Scale className="text-indigo-400" />
              Rent vs Invest
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              "Should I keep my house as a rental or sell it to invest?"
            </p>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
             <button 
               onClick={() => setCompareMode('stock')}
               className={`px-4 py-2 rounded text-sm font-medium transition-all ${compareMode === 'stock' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
               vs Stocks
             </button>
             <button 
               onClick={() => setCompareMode('bond')}
               className={`px-4 py-2 rounded text-sm font-medium transition-all ${compareMode === 'bond' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
               vs Bonds
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8 space-y-12">
        
        {/* --- SECTION 1: THE BATTLE DASHBOARD --- */}
        <div>
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <ArrowRightLeft className="text-indigo-400"/>
             The Two Paths
           </h2>
           
           <div className="flex flex-col lg:flex-row gap-8 items-stretch relative">
             
             {/* LEFT: THE RENTAL BUSINESS */}
             <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="bg-emerald-950/30 border-b border-emerald-900/30 p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                       <Hammer size={20} />
                     </div>
                     <div>
                       <div className="font-bold text-emerald-100">The "Active" Business</div>
                       <div className="text-xs text-emerald-400/70 uppercase tracking-wide">Keep the House</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-2xl font-bold text-white tracking-tight">{formatCurrency(financials.totalMonthlyReturn * 12)}/yr</div>
                     <div className="text-xs text-emerald-400 font-bold">{formatPercent(financials.rentalROE)} ROE</div>
                   </div>
                </div>

                <div className="p-6 space-y-8 flex-1">
                  
                  {/* Anatomy of Return */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <Zap size={12} /> The Real Return (Year 1)
                    </h4>
                    
                    {/* CASH COMPONENT */}
                    <div className="mb-4 bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                          <Droplets size={12}/> Liquid Cash (What you spend)
                        </div>
                        <MathRow 
                          label="Pre-Tax Cash Flow" 
                          value={formatCurrency(financials.monthlyCashFlow)} 
                          valueClass={financials.monthlyCashFlow < 0 ? 'text-rose-400' : 'text-slate-200'}
                        />
                        {financials.monthlyTaxLiability > 0 && (
                            <MathRow 
                              label="Est. Income Tax" 
                              value={`-${formatCurrency(financials.monthlyTaxLiability)}`} 
                              operator="-" 
                              highlight={false} 
                              valueClass="text-rose-400"
                            />
                        )}
                        <div className={`flex justify-between items-center pt-2 mt-2 border-t border-slate-700 font-bold ${financials.afterTaxCashFlow < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            <span>Net "Pocket" Cash</span>
                            <span>{formatCurrency(financials.afterTaxCashFlow)}</span>
                        </div>
                    </div>

                    {/* EQUITY COMPONENT */}
                    <div className="mb-2 bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                           <Lock size={12}/> Illiquid Equity (Trapped)
                        </div>
                        <MathRow label="Forced Savings (Principal)" value={formatCurrency(financials.principalPayment)} />
                        <MathRow label={`Appreciation (${formatPercent(assumptions.appreciationRate)})`} value={formatCurrency(financials.monthlyAppreciation)} operator="+" />
                    </div>
                  </div>

                  {/* The Job Description */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <Briefcase size={12} /> The Job Description
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex gap-2"><Check size={16} className="text-emerald-500 shrink-0"/> Leverage Debt (Keep {formatPercent(assumptions.interestRate)} rate)</li>
                      <li className="flex gap-2"><Check size={16} className="text-emerald-500 shrink-0"/> Shelter Taxes (Depreciation)</li>
                      <li className="flex gap-2"><X size={16} className="text-rose-500 shrink-0"/> Manage Tenants & Repairs</li>
                      <li className="flex gap-2"><X size={16} className="text-rose-500 shrink-0"/> Risk of Vacancy ($0 Income)</li>
                    </ul>
                  </div>

                  {/* Dual Reality Mini-Chart */}
                  <div>
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Your Two Realities</h4>
                     <div className="space-y-4">
                       <div>
                         <div className="flex justify-between text-xs mb-1 text-slate-400">
                           <span>Bank Account Reality (Cash)</span>
                         </div>
                         <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                           {/* Show negative cash flow as red bar from left? or just handle positive */}
                           {financials.monthlyCashFlow > 0 ? (
                              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (financials.monthlyCashFlow / assumptions.monthlyRent) * 100)}%` }}></div>
                           ) : (
                              <div className="h-full bg-rose-500 w-full opacity-50"></div>
                           )}
                         </div>
                         {financials.monthlyCashFlow < 0 && <p className="text-[10px] text-rose-400 mt-1">Cash flow is negative.</p>}
                       </div>
                       <div>
                         <div className="flex justify-between text-xs mb-1 text-slate-400">
                           <span>IRS Tax Reality (Taxable Income)</span>
                         </div>
                         <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                           {financials.taxableIncome > 0 ? (
                              <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (financials.taxableIncome / assumptions.monthlyRent) * 100)}%` }}></div>
                           ) : (
                              <div className="h-full bg-slate-700 w-1"></div>
                           )}
                         </div>
                         <p className="text-[10px] text-slate-500 mt-1">
                           {financials.taxableIncome <= 0 ? "You show a loss on paper (No Tax Due)." : "You show a profit and owe taxes."}
                         </p>
                       </div>
                     </div>
                  </div>

                </div>
             </div>

             {/* CENTER: THE BRIDGE (DESKTOP) */}
             <div className="hidden lg:flex flex-col items-center justify-center relative z-10 -mx-4">
                <div className="bg-slate-950 border border-slate-700 p-2 rounded-full shadow-xl">
                  <ArrowRight size={24} className="text-slate-400" />
                </div>
                <div className="h-full w-px border-l border-dashed border-slate-700 absolute top-0 -z-10"></div>
             </div>

             {/* CENTER: THE BRIDGE (MOBILE) */}
             <div className="lg:hidden flex items-center gap-4 py-4 justify-center">
                <div className="h-px w-full bg-slate-800"></div>
                <div className="text-xs font-bold text-slate-500 whitespace-nowrap">VS</div>
                <div className="h-px w-full bg-slate-800"></div>
             </div>

             {/* RIGHT: THE PASSIVE PORTFOLIO */}
             <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className={`p-4 flex items-center justify-between border-b ${compareMode === 'stock' ? 'bg-indigo-950/30 border-indigo-900/30' : 'bg-amber-950/30 border-amber-900/30'}`}>
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${compareMode === 'stock' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                       {compareMode === 'stock' ? <Coffee size={20} /> : <Lock size={20} />}
                     </div>
                     <div>
                       <div className={`font-bold ${compareMode === 'stock' ? 'text-indigo-100' : 'text-amber-100'}`}>The "Passive" Portfolio</div>
                       <div className={`text-xs uppercase tracking-wide ${compareMode === 'stock' ? 'text-indigo-400/70' : 'text-amber-400/70'}`}>
                         Sell & Buy {compareMode === 'stock' ? 'Stocks' : 'Bonds'}
                       </div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-2xl font-bold text-white tracking-tight">
                        {compareMode === 'stock' 
                          ? formatCurrency(financials.monthlyStockReturn * 12) 
                          : formatCurrency(financials.monthlyBondReturn * 12)
                        }/yr
                     </div>
                     <div className={`text-xs font-bold ${compareMode === 'stock' ? 'text-indigo-400' : 'text-amber-400'}`}>
                       {formatPercent(compareMode === 'stock' ? financials.stockROE : financials.bondROE)} ROE
                     </div>
                   </div>
                </div>

                <div className="p-6 space-y-8 flex-1">
                  
                  {/* The Toll Bridge (Visualizing Selling Costs) */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-rose-500/10 text-rose-500 rounded-bl-lg text-[10px] font-bold">THE EXIT FEE</div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                       <Unlock size={12} /> The cost to switch
                    </h4>
                    <div className="flex items-center justify-between text-sm mb-2">
                       <span className="text-slate-400">House Equity</span>
                       <span className="text-slate-300">{formatCurrency(assumptions.marketValue - financials.loanAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                       <span className="text-rose-400">Selling Costs (Agents, etc.)</span>
                       <span className="text-rose-400">-{formatCurrency(financials.sellingCosts)}</span>
                    </div>
                    <div className="h-px bg-slate-800 my-2"></div>
                    <div className="flex items-center justify-between font-bold text-white">
                       <span>Investable Cash</span>
                       <span>{formatCurrency(financials.netProceeds)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      You start with less money because selling a house is expensive.
                    </p>
                  </div>

                  {/* Anatomy of Return */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <Zap size={12} /> Where the money comes from
                    </h4>
                    {compareMode === 'stock' ? (
                      <>
                        <MathRow label="Dividends (Cash)" value={formatCurrency(financials.netProceeds * 0.015)} highlight={true} />
                        <MathRow label="Appreciation (Growth)" value={formatCurrency((financials.monthlyStockReturn * 12) - (financials.netProceeds * 0.015))} operator="+" />
                        <p className="text-xs text-slate-500 mt-2 italic">
                          Stocks are liquid, but volatile. Most return is growth, not cash.
                        </p>
                      </>
                    ) : (
                      <>
                        <MathRow label="Interest Income" value={formatCurrency(financials.monthlyBondReturn * 12)} highlight={true} />
                        <MathRow label="Principal Growth" value="$0" operator="+" />
                        <p className="text-xs text-slate-500 mt-2 italic">
                          Bonds are safe and boring. 100% of the return is taxable cash.
                        </p>
                      </>
                    )}
                  </div>

                  {/* The Job Description */}
                   <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <Briefcase size={12} /> The Job Description
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex gap-2"><Check size={16} className="text-indigo-500 shrink-0"/> 100% Passive (Do nothing)</li>
                      <li className="flex gap-2"><Check size={16} className="text-indigo-500 shrink-0"/> Liquid (Sell in seconds)</li>
                      <li className="flex gap-2"><X size={16} className="text-slate-600 shrink-0"/> No Leverage Multiplier</li>
                      <li className="flex gap-2"><X size={16} className="text-slate-600 shrink-0"/> No "Fake Expense" Tax Shield</li>
                    </ul>
                  </div>

                </div>
             </div>
           </div>
        </div>

        {/* --- SECTION 2: THE "WHY" (METRIC DEEP DIVE) --- */}
        <div className="pt-8 border-t border-slate-800/50">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-indigo-400" size={20} />
            <h3 className="text-lg font-bold text-slate-200">Understand the Trade-offs</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* SIDEBAR (Selection) */}
            <div className="md:w-1/4 shrink-0">
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sticky top-24">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Select Concept</h4>
                 <div className="space-y-2">
                   {CONCEPT_IDS.map((id) => (
                     <button
                       key={id}
                       onClick={() => toggleConcept(id)}
                       className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all text-left ${
                         selectedConcepts.includes(id)
                           ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium'
                           : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                       }`}
                     >
                       {selectedConcepts.includes(id) ? <CheckSquare size={16} className="shrink-0"/> : <Square size={16} className="shrink-0"/>}
                       <span className="text-left line-clamp-1">{getConceptData(id, financials, assumptions).title}</span>
                     </button>
                   ))}
                 </div>
               </div>
            </div>

            {/* MAIN CONTENT (Stacked List) */}
            <div className="md:w-3/4 space-y-4">
              {selectedConcepts.length === 0 && (
                <div className="text-center p-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Select metrics from the sidebar to compare.
                </div>
              )}
              
              {selectedConcepts.map((id) => {
                const data = getConceptData(id, financials, assumptions);
                return (
                  <CollapsibleCard 
                    key={id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl animate-in slide-in-from-right-2 duration-300"
                    title={data.title}
                    defaultOpen={true}
                  >
                     <div className="mb-4">
                       <p className="text-sm text-slate-400">{data.def}</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {data.rows.map((row) => {
                          const isActiveMode = row.mode === 'rent' || row.mode === compareMode;
                          if (!isActiveMode) return null; // Only show relevant cards
                          
                          return (
                           <div 
                             key={row.mode}
                             className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col ${
                               row.mode === 'rent' ? 'bg-emerald-950/10 border-emerald-900/30' : 
                               row.mode === 'stock' ? 'bg-indigo-950/10 border-indigo-900/30' :
                               'bg-amber-950/10 border-amber-900/30'
                             }`}
                           >
                             <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                               {row.mode === 'rent' && <Hammer size={12}/>}
                               {row.mode === 'stock' && <Coffee size={12}/>}
                               {row.mode === 'bond' && <Lock size={12}/>}
                               {row.label}
                             </div>
                             
                             <div className="text-lg font-bold mb-2 text-white">
                               {row.value}
                             </div>
                             
                             <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                               {row.description}
                             </p>
                           </div>
                         );
                       })}
                     </div>
                  </CollapsibleCard>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- LEVERAGE MODULE (Contextual) --- */}
        {financials.leverageRatio > 1 && (
           <LeverageModule data={assumptions} />
        )}

      </main>

      <AssumptionsDrawer data={assumptions} onChange={handleAssumptionChange} />
    </div>
  );
};

export default App;