import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";

interface CombinedFeature {
  name: string;
  desirability: number;
  viability: number;
  feasibility: number;
  dvfTotal: number;
  compositeScore: number;
  npv: number | null;
  irr: number | null;
  pi: number | null;
  payback: number | null;
  investment: number;
}

const COLORS = {
  desirability: "hsl(220, 70%, 50%)",
  viability: "hsl(160, 60%, 42%)",
  feasibility: "hsl(280, 60%, 55%)",
};

const TIER_COLORS = [
  "hsl(160, 60%, 45%)",
  "hsl(40, 90%, 50%)",
  "hsl(0, 72%, 51%)",
];

/** Stacked bar: DVF breakdown per feature */
export function DVFBreakdownChart({ features }: { features: CombinedFeature[] }) {
  const data = features.slice(0, 10).map((f) => ({
    name: f.name.length > 10 ? f.name.slice(0, 10) + "…" : f.name,
    Desirability: f.desirability,
    Viability: f.viability,
    Feasibility: f.feasibility,
  }));

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-3 sm:p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="font-display font-semibold text-sm mb-1">DVF Score Breakdown</h3>
      <p className="text-[10px] text-muted-foreground mb-3">Stacked by category</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(220, 10%, 46%)" }} interval={0} angle={-25} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 9, fill: "hsl(220, 10%, 46%)" }} width={30} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="Desirability" stackId="dvf" fill={COLORS.desirability} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Viability" stackId="dvf" fill={COLORS.viability} />
          <Bar dataKey="Feasibility" stackId="dvf" fill={COLORS.feasibility} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal bar: Financial metrics comparison */
export function FinancialComparisonChart({ features }: { features: CombinedFeature[] }) {
  const withFinancials = features.filter((f) => f.npv !== null).slice(0, 8);
  if (withFinancials.length === 0) return null;

  const data = withFinancials.map((f) => ({
    name: f.name.length > 12 ? f.name.slice(0, 12) + "…" : f.name,
    NPV: Math.round(f.npv! / 1000),
    Investment: Math.round(f.investment / 1000),
  }));

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-3 sm:p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="font-display font-semibold text-sm mb-1">Financial Comparison</h3>
      <p className="text-[10px] text-muted-foreground mb-3">NPV vs Investment (in $k)</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
          <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(220, 10%, 46%)" }} tickFormatter={(v) => `$${v}k`} />
          <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 9, fill: "hsl(220, 10%, 46%)" }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }}
            formatter={(value: number) => [`$${value}k`]}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="NPV" fill="hsl(160, 60%, 45%)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="Investment" fill="hsl(220, 70%, 50%)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Donut: Score tier distribution */
export function ScoreDistributionChart({ features }: { features: CombinedFeature[] }) {
  const high = features.filter((f) => f.compositeScore >= 70).length;
  const medium = features.filter((f) => f.compositeScore >= 40 && f.compositeScore < 70).length;
  const low = features.filter((f) => f.compositeScore < 40).length;

  const data = [
    { name: "High (≥70)", value: high },
    { name: "Medium (40-69)", value: medium },
    { name: "Low (<40)", value: low },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-3 sm:p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="font-display font-semibold text-sm mb-1">Score Distribution</h3>
      <p className="text-[10px] text-muted-foreground mb-3">Features by composite tier</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={{ strokeWidth: 1 }}
          >
            {data.map((_, i) => {
              const colorIdx = data[i].name.startsWith("High") ? 0 : data[i].name.startsWith("Medium") ? 1 : 2;
              return <Cell key={i} fill={TIER_COLORS[colorIdx]} />;
            })}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Composite score ranking bar */
export function CompositeRankingChart({ features }: { features: CombinedFeature[] }) {
  const data = features.slice(0, 10).map((f) => ({
    name: f.name.length > 12 ? f.name.slice(0, 12) + "…" : f.name,
    score: Math.round(f.compositeScore),
    fill: f.compositeScore >= 70
      ? "hsl(160, 60%, 45%)"
      : f.compositeScore >= 40
      ? "hsl(40, 90%, 50%)"
      : "hsl(0, 72%, 51%)",
  }));

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-3 sm:p-4">
      <h3 className="font-display font-semibold text-sm mb-1">Composite Score Ranking</h3>
      <p className="text-[10px] text-muted-foreground mb-3">Top features by combined DVF + financial score</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(220, 10%, 46%)" }} />
          <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 9, fill: "hsl(220, 10%, 46%)" }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }}
            formatter={(value: number) => [`${value}/100`]}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
