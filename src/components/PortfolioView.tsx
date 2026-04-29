import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FeatureRow, calcTotal, calcCategoryTotal } from "@/lib/dvf-data";
import { FinancialInputs, calcAllFinancials } from "@/lib/financial-calc";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { DVFBreakdownChart, FinancialComparisonChart, ScoreDistributionChart, CompositeRankingChart } from "./PortfolioCharts";
import { Eye, EyeOff, Settings2, ChevronDown, ChevronsUpDown, ArrowUp } from "lucide-react";
import PortfolioSkeleton from "./PortfolioSkeleton";

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
  discountRate: number;
  cashFlows: { year: number; amount: number }[];
  dcfValues: number[];
}

const MAX_DVF = 12 * 21;

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
        discountRate: fin?.discountRate ?? 10,
        cashFlows: fin?.cashFlows ?? [],
        dcfValues: results?.dcfValues ?? [],
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

const CHART_TYPES = [
  { key: "radar", label: "DVF Comparison" },
  { key: "bubble", label: "DVF vs NPV Bubble" },
  { key: "dvfBreakdown", label: "DVF Score Breakdown" },
  { key: "compositeRanking", label: "Composite Ranking" },
  { key: "financialComparison", label: "Financial Comparison" },
  { key: "scoreDistribution", label: "Score Distribution" },
] as const;

type ChartKey = (typeof CHART_TYPES)[number]["key"];

const CHART_STORAGE_KEY = "dvf-portfolio-charts";

function loadChartVisibility(): Record<ChartKey, boolean> {
  try {
    const saved = localStorage.getItem(CHART_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return Object.fromEntries(CHART_TYPES.map((c) => [c.key, true])) as Record<ChartKey, boolean>;
}

const PortfolioView = ({ rows, financials }: Props) => {
  const combined = useMemo(() => buildCombined(rows, financials), [rows, financials]);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCharts, setVisibleCharts] = useState<Record<ChartKey, boolean>>(loadChartVisibility);
  const [showSettings, setShowSettings] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [rows, financials]);

  useEffect(() => {
    localStorage.setItem(CHART_STORAGE_KEY, JSON.stringify(visibleCharts));
  }, [visibleCharts]);

  const toggleChart = (key: ChartKey) => {
    setVisibleCharts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allVisible = CHART_TYPES.every((c) => visibleCharts[c.key]);

  if (isLoading && combined.length > 0) {
    return <PortfolioSkeleton />;
  }

  if (combined.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 text-center text-muted-foreground text-sm animate-fade-in" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="font-display font-semibold text-base text-foreground mb-2">No features yet</div>
        Add named features in the DVF Scoring tab to see the portfolio view.
      </div>
    );
  }

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
      {/* Chart Visibility Toggle */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm" style={{ boxShadow: 'var(--shadow-card)' }}>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors rounded-xl"
        >
          <span className="flex items-center gap-2">
            <Settings2 size={15} className="text-muted-foreground" />
            Customize Charts
          </span>
          <span className="text-xs text-muted-foreground">
            {CHART_TYPES.filter((c) => visibleCharts[c.key]).length}/{CHART_TYPES.length} visible
          </span>
        </button>
        {showSettings && (
          <div className="px-4 pb-3 pt-1 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Toggle charts on or off</p>
              <button
                onClick={() => {
                  const newVal = !allVisible;
                  setVisibleCharts(
                    Object.fromEntries(CHART_TYPES.map((c) => [c.key, newVal])) as Record<ChartKey, boolean>
                  );
                }}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {allVisible ? "Hide All" : "Show All"}
              </button>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
              {CHART_TYPES.map((chart) => (
                <button
                  key={chart.key}
                  onClick={() => toggleChart(chart.key)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors border ${
                    visibleCharts[chart.key]
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground"
                  }`}
                >
                  {visibleCharts[chart.key] ? <Eye size={13} /> : <EyeOff size={13} />}
                  <span className="truncate">{chart.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Radar Chart */}
      {visibleCharts.radar && combined.length >= 2 && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-3 sm:p-4" style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h3 className="font-display font-semibold text-sm mb-3">DVF Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(220, 15%, 90%)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: "hsl(220, 10%, 46%)" }}
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
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Bubble Chart */}
      {visibleCharts.bubble && (() => {
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
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-3 sm:p-4" style={{ boxShadow: 'var(--shadow-card)' }}
        >
            <h3 className="font-display font-semibold text-sm mb-1">DVF Score vs NPV</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Bubble size = initial investment</p>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis
                  dataKey="dvf"
                  type="number"
                  name="DVF Score"
                  domain={[0, MAX_DVF]}
                  tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }}
                  label={{ value: "DVF Score", position: "bottom", offset: 0, fontSize: 10, fill: "hsl(220, 10%, 46%)" }}
                />
                <YAxis
                  dataKey="npv"
                  type="number"
                  name="NPV"
                  tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  width={50}
                />
                <ZAxis dataKey="z" type="number" range={[60, 400]} domain={[0, maxInvestment]} />
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
        </motion.div>
        );
      })()}

      {/* Additional Charts */}
      {(visibleCharts.dvfBreakdown || visibleCharts.compositeRanking) && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {visibleCharts.dvfBreakdown && <DVFBreakdownChart features={combined} />}
          {visibleCharts.compositeRanking && <CompositeRankingChart features={combined} />}
        </motion.div>
      )}
      {(visibleCharts.financialComparison || visibleCharts.scoreDistribution) && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {visibleCharts.financialComparison && <FinancialComparisonChart features={combined} />}
          {visibleCharts.scoreDistribution && <ScoreDistributionChart features={combined} />}
        </motion.div>
      )}

      {/* Expand/Collapse All + Cards */}
      {combined.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              const allExpanded = combined.every((_, i) => expandedCards.has(i));
              if (allExpanded) {
                setExpandedCards(new Set());
              } else {
                setExpandedCards(new Set(combined.map((_, i) => i)));
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <ChevronsUpDown size={14} />
            {combined.every((_, i) => expandedCards.has(i)) ? "Collapse All" : "Expand All"}
          </button>
        </div>
      )}
      {combined.map((feat, i) => {
        const tier = tierBadge(feat.compositeScore);
        const hasFinancials = feat.npv !== null;
        const isExpanded = expandedCards.has(i);

        return (
          <motion.div
            key={feat.name + i}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
            className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm overflow-hidden hover-lift hover-glow"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Header - clickable */}
            <button
              onClick={() => toggleExpand(i)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-3 border-b border-border gap-2 hover:bg-secondary/30 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tier.className} hidden sm:inline`}>
                  {tier.label}
                </span>
                <span className={`font-display font-bold text-base sm:text-lg ${tierColor(feat.compositeScore)}`}>
                  {Math.round(feat.compositeScore)}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                />
              </div>
            </button>

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
            <div className="px-3 sm:px-4 py-2.5">
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.min(feat.compositeScore, 100)}%` }}
                />
              </div>
            </div>

            {/* Expandable detail panel */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border bg-secondary/20 px-3 sm:px-4 py-4 space-y-4">
                    {/* DVF Breakdown */}
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">DVF Score Breakdown</h5>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Desirability", value: feat.desirability, max: 4 * 21, color: "bg-desirability" },
                          { label: "Viability", value: feat.viability, max: 4 * 21, color: "bg-viability" },
                          { label: "Feasibility", value: feat.feasibility, max: 4 * 21, color: "bg-feasibility" },
                        ].map((dim) => (
                          <div key={dim.label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{dim.label}</span>
                              <span className="font-semibold">{Math.round((dim.value / dim.max) * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full ${dim.color} transition-all duration-500`}
                                style={{ width: `${(dim.value / dim.max) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Breakdown */}
                    {hasFinancials ? (
                      <div className="space-y-3">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financial Breakdown</h5>
                        
                        {/* Key financial metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: "Investment", value: formatCurrency(feat.investment) },
                            { label: "Discount Rate", value: `${feat.discountRate}%` },
                            { label: "Payback", value: feat.payback !== null ? `${feat.payback.toFixed(1)} yrs` : "Never" },
                            { label: "Composite", value: `${Math.round(feat.compositeScore)}/100` },
                          ].map((m) => (
                            <div key={m.label} className="rounded-lg bg-card border border-border/60 px-3 py-2 text-center">
                              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
                              <div className="font-display font-semibold text-sm mt-0.5">{m.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Cash Flow Table */}
                        {feat.cashFlows.length > 0 && (
                          <div className="rounded-lg border border-border/60 overflow-hidden">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-secondary/50">
                                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Year</th>
                                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Cash Flow</th>
                                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Discounted</th>
                                  <th className="text-right px-3 py-2 font-medium text-muted-foreground hidden sm:table-cell">Cumulative</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-border/40">
                                  <td className="px-3 py-1.5 font-medium">0</td>
                                  <td className="px-3 py-1.5 text-right text-destructive font-semibold">
                                    -{formatCurrency(feat.investment)}
                                  </td>
                                  <td className="px-3 py-1.5 text-right text-destructive font-semibold">
                                    -{formatCurrency(feat.investment)}
                                  </td>
                                  <td className="px-3 py-1.5 text-right text-destructive font-semibold hidden sm:table-cell">
                                    -{formatCurrency(feat.investment)}
                                  </td>
                                </tr>
                                {feat.cashFlows.map((cf, idx) => {
                                  const dcf = feat.dcfValues[idx] ?? 0;
                                  const cumulative = feat.dcfValues.slice(0, idx + 1).reduce((a, b) => a + b, 0) - feat.investment;
                                  return (
                                    <tr key={cf.year} className="border-t border-border/40">
                                      <td className="px-3 py-1.5 font-medium">{cf.year}</td>
                                      <td className="px-3 py-1.5 text-right">{formatCurrency(cf.amount)}</td>
                                      <td className="px-3 py-1.5 text-right">{formatCurrency(dcf)}</td>
                                      <td className={`px-3 py-1.5 text-right font-semibold hidden sm:table-cell ${cumulative >= 0 ? "text-accent" : "text-destructive"}`}>
                                        {formatCurrency(cumulative)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-card border border-border/60 px-4 py-3 text-center">
                        <p className="text-xs text-muted-foreground">
                          No financial data available. Add investment & cash flows in the Financial Model tab.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

function MetricCell({ label, value, sub, className = "" }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className="bg-card px-2 sm:px-3 py-2 sm:py-2.5 text-center">
      <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5 truncate">{label}</div>
      <div className={`font-display font-semibold text-xs sm:text-sm ${className}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default PortfolioView;
