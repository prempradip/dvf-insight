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
    <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 rounded-lg px-3 py-2 text-sm font-medium ${styles.container}`}>
      <div className="flex items-center gap-2">
        <span className="opacity-70 whitespace-nowrap text-xs sm:text-sm">{label}</span>
        <span className="font-display font-bold text-base">{score}</span>
        <span className="text-xs opacity-50">/ {maxScore}</span>
      </div>
      <div className="sm:ml-auto h-1.5 w-full sm:w-12 rounded-full bg-foreground/10 overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${styles.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default ScoreBadge;
