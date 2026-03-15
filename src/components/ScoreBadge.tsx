interface ScoreBadgeProps {
  label: string;
  score: number;
  maxScore: number;
  variant: "desirability" | "viability" | "feasibility" | "total";
}

const variantClasses: Record<string, { container: string; bar: string }> = {
  desirability: { container: "bg-desirability-light text-desirability", bar: "bg-desirability" },
  viability: { container: "bg-viability-light text-viability", bar: "bg-viability" },
  feasibility: { container: "bg-feasibility-light text-feasibility", bar: "bg-feasibility" },
  total: { container: "bg-primary/10 text-primary", bar: "bg-primary" },
};

const ScoreBadge = ({ label, score, maxScore, variant }: ScoreBadgeProps) => {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const styles = variantClasses[variant];

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${styles.container} transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-center gap-2">
        <span className="opacity-60 whitespace-nowrap text-[10px] sm:text-xs uppercase tracking-wider font-semibold">{label}</span>
        <span className="font-display font-bold text-lg">{score}</span>
        <span className="text-[10px] opacity-40 font-medium">/ {maxScore}</span>
      </div>
      <div className="sm:ml-auto h-2 w-full sm:w-14 rounded-full bg-foreground/8 overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${styles.bar} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default ScoreBadge;
