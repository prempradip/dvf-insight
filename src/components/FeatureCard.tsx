import { FeatureRow, CRITERIA, ScoreValue, calcTotal, calcCategoryTotal } from "@/lib/dvf-data";
import ScoreSelector from "./ScoreSelector";
import ScoreBadge from "./ScoreBadge";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FeatureCardProps {
  row: FeatureRow;
  index: number;
  onChange: (row: FeatureRow) => void;
  onDelete: () => void;
}

const categories = [
  { key: "desirability" as const, label: "Desirability", maxPerCriterion: 21 },
  { key: "viability" as const, label: "Viability", maxPerCriterion: 21 },
  { key: "feasibility" as const, label: "Feasibility", maxPerCriterion: 21 },
];

const categoryHeadingClasses: Record<string, string> = {
  desirability: "text-desirability",
  viability: "text-viability",
  feasibility: "text-feasibility",
};

const FeatureCard = ({ row, index, onChange, onDelete }: FeatureCardProps) => {
  const [expanded, setExpanded] = useState(true);
  const total = calcTotal(row);
  const maxTotal = CRITERIA.length * 21;

  const updateScore = (criterionId: string, value: ScoreValue) => {
    onChange({ ...row, scores: { ...row.scores, [criterionId]: value } });
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-3 border-b border-border">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold font-display flex-shrink-0">
          {index + 1}
        </span>
        <input
          type="text"
          placeholder="Epic / Category"
          value={row.epic}
          onChange={(e) => onChange({ ...row, epic: e.target.value })}
          className="w-28 sm:w-32 bg-transparent border-b border-transparent hover:border-border focus:border-primary text-sm font-medium text-muted-foreground placeholder:text-muted-foreground/50 outline-none transition-colors flex-shrink-0"
        />
        <input
          type="text"
          placeholder="Feature name..."
          value={row.name}
          onChange={(e) => onChange({ ...row, name: e.target.value })}
          className="flex-1 min-w-[120px] bg-transparent border-b border-transparent hover:border-border focus:border-primary text-sm font-semibold placeholder:text-muted-foreground/50 outline-none transition-colors"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-display font-bold text-lg text-primary">{total}</span>
          <span className="text-xs text-muted-foreground">/ {maxTotal}</span>
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
          {/* Score badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((cat) => {
              const critCount = CRITERIA.filter((c) => c.category === cat.key).length;
              return (
                <ScoreBadge
                  key={cat.key}
                  label={cat.label}
                  score={calcCategoryTotal(row, cat.key)}
                  maxScore={critCount * cat.maxPerCriterion}
                  variant={cat.key}
                />
              );
            })}
            <ScoreBadge label="Total" score={total} maxScore={maxTotal} variant="total" />
          </div>

          {/* Criteria grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-3">
                <h4 className={`text-xs font-semibold uppercase tracking-wider ${categoryHeadingClasses[cat.key]} border-b border-border pb-2`}>
                  {cat.label}
                </h4>
                <div className="space-y-3">
                  {CRITERIA.filter((c) => c.category === cat.key).map((criterion) => (
                    <div key={criterion.id} className="space-y-1">
                      <label className="text-xs font-medium text-foreground/80 block">{criterion.label}</label>
                      <p className="text-[10px] text-muted-foreground leading-tight min-h-[24px]">{criterion.description}</p>
                      <ScoreSelector
                        value={row.scores[criterion.id] ?? null}
                        onChange={(v) => updateScore(criterion.id, v)}
                        inverted={criterion.inverted}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
