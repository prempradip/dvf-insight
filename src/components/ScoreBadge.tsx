interface ScoreBadgeProps {
  label: string;
  score: number;
  maxScore: number;
  variant: "desirability" | "viability" | "feasibility" | "total";
}

const variantClasses: Record<string, string> = {
  desirability: "bg-desirability-light text-desirability",
  viability: "bg-viability-light text-viability",
  feasibility: "bg-feasibility-light text-feasibility",
  total: "bg-primary/10 text-primary",
};

const ScoreBadge = ({ label, score, maxScore, variant }: ScoreBadgeProps) => {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${variantClasses[variant]}`}>
      <span className="opacity-70">{label}</span>
      <span className="font-display font-bold text-base">{score}</span>
      <span className="text-xs opacity-50">/ {maxScore}</span>
      <div className="ml-auto h-1.5 w-12 rounded-full bg-current/15 overflow-hidden">
        <div className="h-full rounded-full bg-current transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default ScoreBadge;
