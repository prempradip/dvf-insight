import { FinancialInputs, calcAllFinancials } from "@/lib/financial-calc";

interface Props {
  inputs: FinancialInputs[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const FinancialSummaryTable = ({ inputs }: Props) => {
  const scored = inputs
    .filter((i) => i.featureName.trim() !== "" && i.initialInvestment > 0)
    .map((i) => ({ ...i, results: calcAllFinancials(i) }))
    .sort((a, b) => b.results.npv - a.results.npv);

  if (scored.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Financial Ranking</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[580px]">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left px-4 py-2.5 font-medium w-10">#</th>
              <th className="text-left px-4 py-2.5 font-medium">Feature</th>
              <th className="text-right px-3 py-2.5 font-medium w-24">Investment</th>
              <th className="text-right px-3 py-2.5 font-medium w-24">NPV</th>
              <th className="text-right px-3 py-2.5 font-medium w-16">IRR</th>
              <th className="text-right px-3 py-2.5 font-medium w-20">Payback</th>
              <th className="text-right px-3 py-2.5 font-medium w-14">PI</th>
            </tr>
          </thead>
          <tbody>
            {scored.map((item, i) => {
              const r = item.results;
              const npvPositive = r.npv >= 0;
              return (
                <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-display font-bold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{item.featureName}</td>
                  <td className="text-right px-3 py-3 text-muted-foreground">{formatCurrency(item.initialInvestment)}</td>
                  <td className={`text-right px-3 py-3 font-display font-semibold ${npvPositive ? "text-accent" : "text-destructive"}`}>
                    {formatCurrency(r.npv)}
                  </td>
                  <td className="text-right px-3 py-3 font-display font-semibold">
                    {r.irr !== null ? `${r.irr.toFixed(1)}%` : "N/A"}
                  </td>
                  <td className="text-right px-3 py-3">
                    {r.paybackPeriod !== null ? `${r.paybackPeriod.toFixed(1)} yrs` : "Never"}
                  </td>
                  <td className={`text-right px-3 py-3 font-display font-semibold ${r.profitabilityIndex >= 1 ? "text-accent" : "text-destructive"}`}>
                    {r.profitabilityIndex.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialSummaryTable;
