import { FeatureRow, CRITERIA, calcTotal, calcCategoryTotal } from "@/lib/dvf-data";

interface Props {
  rows: FeatureRow[];
}

const DVFSummaryTable = ({ rows }: Props) => {
  const scored = rows
    .filter((r) => r.name.trim() !== "")
    .map((r) => ({ ...r, total: calcTotal(r) }))
    .sort((a, b) => b.total - a.total);

  if (scored.length === 0) return null;

  const maxTotal = CRITERIA.length * 21;

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm overflow-hidden animate-fade-in" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="px-4 py-3 border-b border-border/60 bg-secondary/30">
        <h3 className="font-display font-semibold text-sm gradient-text">Priority Ranking</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left px-4 py-2.5 font-medium w-10">#</th>
              <th className="text-left px-4 py-2.5 font-medium">Feature</th>
              <th className="text-center px-3 py-2.5 font-medium text-desirability w-16">D</th>
              <th className="text-center px-3 py-2.5 font-medium text-viability w-16">V</th>
              <th className="text-center px-3 py-2.5 font-medium text-feasibility w-16">F</th>
              <th className="text-center px-3 py-2.5 font-medium w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {scored.map((row, i) => {
              const pct = Math.round((row.total / maxTotal) * 100);
              return (
                <tr key={row.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-display font-bold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{row.name}</span>
                    {row.epic && <span className="ml-2 text-xs text-muted-foreground">({row.epic})</span>}
                  </td>
                  <td className="text-center px-3 py-3 font-display font-semibold text-desirability">{calcCategoryTotal(row, "desirability")}</td>
                  <td className="text-center px-3 py-3 font-display font-semibold text-viability">{calcCategoryTotal(row, "viability")}</td>
                  <td className="text-center px-3 py-3 font-display font-semibold text-feasibility">{calcCategoryTotal(row, "feasibility")}</td>
                  <td className="text-center px-3 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-display font-bold text-primary">{row.total}</span>
                      <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
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

export default DVFSummaryTable;
