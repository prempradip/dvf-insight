import { FeatureRow, calcTotal, calcCategoryTotal } from "@/lib/dvf-data";
import { FinancialInputs, calcAllFinancials } from "@/lib/financial-calc";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";

interface Props {
  rows: FeatureRow[];
  financials: FinancialInputs[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

interface CombinedFeature {
  name: string;
  epic: string;
  dvfTotal: number;
  dvfPct: number;
  desirability: number;
  viability: number;
  feasibility: number;
  npv: number | null;
  irr: number | null;
  pi: number | null;
  payback: number | null;
  investment: number;
  compositeScore: number;
}

const MAX_DVF = 12 * 21; // 12 criteria × max 21

function buildCombined(rows: FeatureRow[], financials: FinancialInputs[]): CombinedFeature[] {
  const finByFeatureId = new Map(
    financials.filter((f) => f.featureId && f.initialInvestment > 0).map((f) => [f.featureId, f])
  );

  return rows
    .filter((r) => r.name.trim() !== "")
    .map((r) => {
      const dvfTotal = calcTotal(r);
      const dvfPct = dvfTotal / MAX_DVF;
      const fin = finByFeatureId.get(r.id);
      const results = fin ? calcAllFinancials(fin) : null;

      // Composite: normalised DVF (0-1) * 50 + normalised PI (clamped 0-2 → 0-1) * 50
      const piNorm = results ? Math.min(Math.max(results.profitabilityIndex / 2, 0), 1) : 0;
      const hasFinancials = results !== null;
      const compositeScore = hasFinancials
        ? dvfPct * 50 + piNorm * 50
        : dvfPct * 100;

      return {
        name: r.name,
        epic: r.epic,
        dvfTotal,
        dvfPct,
        desirability: calcCategoryTotal(r, "desirability"),
        viability: calcCategoryTotal(r, "viability"),
        feasibility: calcCategoryTotal(r, "feasibility"),
        npv: results?.npv ?? null,
        irr: results?.irr ?? null,
        pi: results?.profitabilityIndex ?? null,
        payback: results?.paybackPeriod ?? null,
        investment: fin?.initialInvestment ?? 0,
        compositeScore,
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);
}

function tierColor(pct: number): string {
  if (pct >= 70) return "text-accent";
  if (pct >= 40) return "text-[hsl(var(--score-medium))]";
  return "text-destructive";
}

function tierBadge(pct: number): { label: string; className: string } {
  if (pct >= 70) return { label: "High", className: "bg-accent/15 text-accent" };
  if (pct >= 40) return { label: "Medium", className: "bg-[hsl(var(--score-medium))]/15 text-[hsl(var(--score-medium))]" };
  return { label: "Low", className: "bg-destructive/15 text-destructive" };
}

const PortfolioView = ({ rows, financials }: Props) => {
  const combined = buildCombined(rows, financials);

  if (combined.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm animate-fade-in">
        Add named features in the DVF Scoring tab to see the portfolio view.
      </div>
    );
  }

  // Max per category: Desirability=4 criteria, Viability=4, Feasibility=4, each max 21
  const maxD = 4 * 21;
  const maxV = 4 * 21;
  const maxF = 4 * 21;

  const radarData = [
    {
      dimension: "Desirability",
      ...Object.fromEntries(combined.map((f) => [f.name, Math.round((f.desirability / maxD) * 100)])),
    },
    {
      dimension: "Viability",
      ...Object.fromEntries(combined.map((f) => [f.name, Math.round((f.viability / maxV) * 100)])),
    },
    {
      dimension: "Feasibility",
      ...Object.fromEntries(combined.map((f) => [f.name, Math.round((f.feasibility / maxF) * 100)])),
    },
  ];

  const COLORS = [
    "hsl(220, 70%, 50%)",
    "hsl(160, 60%, 45%)",
    "hsl(280, 60%, 55%)",
    "hsl(40, 90%, 50%)",
    "hsl(0, 72%, 51%)",
    "hsl(190, 70%, 45%)",
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Radar Chart */}
      {combined.length >= 2 && (
        <div className="rounded-xl border border-border bg-card shadow-sm p-4">
          <h3 className="font-display font-semibold text-sm mb-3">DVF Comparison</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(220, 15%, 90%)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }}
                tickFormatter={(v: number) => `${v}%`}
              />
              {combined.slice(0, 6).map((feat, i) => (
                <Radar
                  key={feat.name}
                  name={feat.name}
                  dataKey={feat.name}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bubble Chart: DVF Score vs NPV, bubble size = investment */}
      {(() => {
        const bubbleFeatures = combined.filter((f) => f.npv !== null && f.investment > 0);
        if (bubbleFeatures.length === 0) return null;
        const maxInvestment = Math.max(...bubbleFeatures.map((f) => f.investment));
        const bubbleData = bubbleFeatures.map((f) => ({
          name: f.name,
          dvf: f.dvfTotal,
          npv: f.npv!,
          investment: f.investment,
          z: f.investment,
        }));

        return (
          <div className="rounded-xl border border-border bg-card shadow-sm p-4">
            <h3 className="font-display font-semibold text-sm mb-1">DVF Score vs NPV</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Bubble size = initial investment</p>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis
                  dataKey="dvf"
                  type="number"
                  name="DVF Score"
                  domain={[0, MAX_DVF]}
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
                  label={{ value: "DVF Score", position: "bottom", offset: 0, fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
                />
                <YAxis
                  dataKey="npv"
                  type="number"
                  name="NPV"
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  label={{ value: "NPV", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
                />
                <ZAxis dataKey="z" type="number" range={[80, 600]} domain={[0, maxInvestment]} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
                        <div className="font-display font-semibold mb-1">{d.name}</div>
                        <div>DVF: <span className="font-semibold">{d.dvf}</span></div>
                        <div>NPV: <span className="font-semibold">{formatCurrency(d.npv)}</span></div>
                        <div>Investment: <span className="font-semibold">{formatCurrency(d.investment)}</span></div>
                      </div>
                    );
                  }}
                />
                <Scatter data={bubbleData}>
                  {bubbleData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} fillOpacity={0.7} stroke={COLORS[idx % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Cards for each feature */}
      {combined.map((feat, i) => {
        const tier = tierBadge(feat.compositeScore);
        const hasFinancials = feat.npv !== null;

        return (
          <div
            key={feat.name + i}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-display font-bold text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="font-display font-semibold text-sm truncate">{feat.name}</h4>
                  {feat.epic && (
                    <span className="text-xs text-muted-foreground">{feat.epic}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tier.className}`}>
                  {tier.label}
                </span>
                <span className={`font-display font-bold text-lg ${tierColor(feat.compositeScore)}`}>
                  {Math.round(feat.compositeScore)}
                </span>
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-border">
              <MetricCell label="DVF Score" value={`${feat.dvfTotal}/${MAX_DVF}`} sub={`${Math.round(feat.dvfPct * 100)}%`} />
              <MetricCell label="Desirability" value={String(feat.desirability)} className="text-desirability" />
              <MetricCell label="Viability" value={String(feat.viability)} className="text-viability" />
              <MetricCell label="Feasibility" value={String(feat.feasibility)} className="text-feasibility" />
              <MetricCell
                label="NPV"
                value={hasFinancials ? formatCurrency(feat.npv!) : "—"}
                className={hasFinancials ? (feat.npv! >= 0 ? "text-accent" : "text-destructive") : ""}
              />
              <MetricCell
                label="IRR"
                value={feat.irr !== null ? `${feat.irr.toFixed(1)}%` : "—"}
              />
              <MetricCell
                label="PI"
                value={feat.pi !== null ? feat.pi.toFixed(2) : "—"}
                className={feat.pi !== null ? (feat.pi >= 1 ? "text-accent" : "text-destructive") : ""}
              />
            </div>

            {/* Composite bar */}
            <div className="px-4 py-2.5">
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.min(feat.compositeScore, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function MetricCell({ label, value, sub, className = "" }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className="bg-card px-3 py-2.5 text-center">
      <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`font-display font-semibold text-sm ${className}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default PortfolioView;
