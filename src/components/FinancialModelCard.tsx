import { FinancialInputs, calcAllFinancials } from "@/lib/financial-calc";
import { Trash2, ChevronDown, ChevronUp, DollarSign, TrendingUp, Clock, BarChart3 } from "lucide-react";
import { useState } from "react";

interface Props {
  input: FinancialInputs;
  index: number;
  onChange: (updated: FinancialInputs) => void;
  onDelete: () => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const formatPct = (v: number | null) => (v !== null ? `${v.toFixed(2)}%` : "N/A");
const formatYears = (v: number | null) => (v !== null ? `${v.toFixed(1)} yrs` : "Never");

const FinancialModelCard = ({ input, index, onChange, onDelete }: Props) => {
  const [expanded, setExpanded] = useState(true);
  const results = calcAllFinancials(input);

  const updateCashFlow = (year: number, amount: number) => {
    const updated = input.cashFlows.map((cf) => (cf.year === year ? { ...cf, amount } : cf));
    onChange({ ...input, cashFlows: updated });
  };

  const addYear = () => {
    const nextYear = input.cashFlows.length > 0 ? Math.max(...input.cashFlows.map((c) => c.year)) + 1 : 1;
    onChange({ ...input, cashFlows: [...input.cashFlows, { year: nextYear, amount: 0 }] });
  };

  const removeYear = (year: number) => {
    if (input.cashFlows.length <= 1) return;
    onChange({ ...input, cashFlows: input.cashFlows.filter((cf) => cf.year !== year) });
  };

  const npvPositive = results.npv >= 0;
  const piGood = results.profitabilityIndex >= 1;

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm overflow-hidden animate-fade-in hover-lift" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-3 border-b border-border">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-bold font-display flex-shrink-0">
          {index + 1}
        </span>
        <input
          type="text"
          placeholder="Feature name..."
          value={input.featureName}
          readOnly={!!input.featureId}
          onChange={(e) => onChange({ ...input, featureName: e.target.value })}
          className={`flex-1 min-w-[120px] bg-transparent border-b border-transparent hover:border-border focus:border-primary text-sm font-semibold placeholder:text-muted-foreground/50 outline-none transition-colors ${input.featureId ? "cursor-default text-muted-foreground" : ""}`}
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`font-display font-bold text-lg ${npvPositive ? "text-accent" : "text-destructive"}`}>
            {formatCurrency(results.npv)}
          </span>
          <span className="text-xs text-muted-foreground">NPV</span>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-5">
          {/* Results summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ResultBadge
              icon={<DollarSign size={14} />}
              label="NPV"
              value={formatCurrency(results.npv)}
              positive={npvPositive}
            />
            <ResultBadge
              icon={<TrendingUp size={14} />}
              label="IRR"
              value={formatPct(results.irr)}
              positive={results.irr !== null && results.irr > input.discountRate}
            />
            <ResultBadge
              icon={<Clock size={14} />}
              label="Payback"
              value={formatYears(results.paybackPeriod)}
              positive={results.paybackPeriod !== null}
            />
            <ResultBadge
              icon={<BarChart3 size={14} />}
              label="PI"
              value={results.profitabilityIndex.toFixed(2)}
              positive={piGood}
            />
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Investment & Discount Rate */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary border-b border-border pb-2">
                Investment Parameters
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80 block">Initial Investment ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={input.initialInvestment || ""}
                    onChange={(e) => onChange({ ...input, initialInvestment: Number(e.target.value) || 0 })}
                    placeholder="e.g. 100000"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80 block">Discount Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={input.discountRate || ""}
                    onChange={(e) => onChange({ ...input, discountRate: Number(e.target.value) || 0 })}
                    placeholder="e.g. 10"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Right: Cash Flows */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-accent border-b border-border pb-2">
                Projected Cash Flows
              </h4>
              <div className="space-y-2">
                {input.cashFlows.map((cf) => (
                  <div key={cf.year} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-14 flex-shrink-0">Year {cf.year}</span>
                    <input
                      type="number"
                      value={cf.amount || ""}
                      onChange={(e) => updateCashFlow(cf.year, Number(e.target.value) || 0)}
                      placeholder="0"
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-[10px] text-muted-foreground w-16 text-right flex-shrink-0">
                      PV: {formatCurrency(results.dcfValues[input.cashFlows.indexOf(cf)] ?? 0)}
                    </span>
                    {input.cashFlows.length > 1 && (
                      <button
                        onClick={() => removeYear(cf.year)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addYear}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  + Add Year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ResultBadge({ icon, label, value, positive }: { icon: React.ReactNode; label: string; value: string; positive: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2.5 ${positive ? "bg-accent/10" : "bg-destructive/10"}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={positive ? "text-accent" : "text-destructive"}>{icon}</span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <span className={`font-display font-bold text-sm ${positive ? "text-accent" : "text-destructive"}`}>{value}</span>
    </div>
  );
}

export default FinancialModelCard;
