import React from 'react';
import { Assumptions } from '../types';
import { ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

interface Props {
  data: Assumptions;
  onChange: (key: keyof Assumptions, value: number | boolean) => void;
}

export const AssumptionsDrawer: React.FC<Props> = ({ data, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const InputGroup = ({ label, field, unit, step = 0.1, tooltip }: { label: string, field: keyof Assumptions, unit?: string, step?: number, tooltip?: string }) => (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <label className="text-xs text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
        {label}
        {tooltip && <span className="text-[10px] bg-slate-700 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help" title={tooltip}>?</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          step={step}
          value={Number(data[field]).toString()}
          onChange={(e) => onChange(field, parseFloat(e.target.value))}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {unit && <span className="absolute right-3 top-2 text-slate-500 text-sm">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 z-50 ${isOpen ? 'h-auto' : 'h-12'}`}>
      <div 
        className="flex items-center justify-between px-6 h-12 cursor-pointer hover:bg-slate-800 transition-colors border-b border-slate-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
          <RefreshCw size={16} />
          <span>Adjust Assumptions</span>
        </div>
        {isOpen ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronUp size={20} className="text-slate-500" />}
      </div>

      {isOpen && (
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-h-[50vh] overflow-y-auto pb-12">
          
          <div className="col-span-2 md:col-span-4 lg:col-span-6 pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">The House (Assets)</h4>
          </div>
          <InputGroup label="Current Market Value" field="marketValue" unit="$" step={1000} />
          <InputGroup label="Purchase Price" field="purchasePrice" unit="$" step={1000} />
          <InputGroup label="Monthly Rent" field="monthlyRent" unit="$" step={50} />
          <InputGroup label="Appreciation Est." field="appreciationRate" unit="%" />
          
          <div className="col-span-2 md:col-span-4 lg:col-span-6 pb-2 border-b border-slate-800 mt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">The Debt (Liabilities)</h4>
          </div>
          <InputGroup label="Loan Interest Rate" field="interestRate" unit="%" step={0.125} />
          <InputGroup label="Orig. Down Payment" field="downPaymentPercent" unit="%" step={1} />
          <InputGroup label="Loan Term" field="loanTermYears" unit="Yrs" step={5} />
          
          <div className="col-span-2 md:col-span-4 lg:col-span-6 pb-2 border-b border-slate-800 mt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500">Comparisons (Market)</h4>
          </div>
          <InputGroup label="Stock Expected Return" field="stockReturnRate" unit="%" />
          <InputGroup label="Bond/CD Yield" field="bondYieldRate" unit="%" />
          <InputGroup label="Selling/Closing Costs" field="sellingCostPercent" unit="%" tooltip="Agent fees + Transfer tax" />
          <InputGroup label="Marginal Tax Rate" field="marginalTaxRate" unit="%" />

          <div className="col-span-2 md:col-span-4 lg:col-span-6 pb-2 border-b border-slate-800 mt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ops Expenses</h4>
          </div>
          <InputGroup label="Vacancy Rate" field="vacancyRate" unit="%" />
          <InputGroup label="Management Fee" field="managementFee" unit="%" />
          <InputGroup label="Maintenance" field="maintenanceRate" unit="%" />
          <InputGroup label="Property Tax" field="propertyTaxRate" unit="%" />
          
        </div>
      )}
    </div>
  );
};