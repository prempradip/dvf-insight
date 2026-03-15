import { FeatureRow, CRITERIA, ScoreValue, calcTotal, calcCategoryTotal, CRITERION_LABELS, FEASIBILITY_LABELS, SCORE_OPTIONS, INVERTED_SCORE_OPTIONS } from "@/lib/dvf-data";
import ScoreSelector from "./ScoreSelector";
import ScoreBadge from "./ScoreBadge";
import { Trash2, ChevronDown, ChevronUp, Info, X } from "lucide-react";
import { PopoverClose } from "@radix-ui/react-popover";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm overflow-hidden animate-fade-in hover-lift" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold font-display flex-shrink-0">
            {index + 1}
          </span>
          <input
            type="text"
            placeholder="Epic / Category"
            value={row.epic}
            onChange={(e) => onChange({ ...row, epic: e.target.value })}
            className="w-24 sm:w-32 bg-transparent border-b border-transparent hover:border-border focus:border-primary text-sm font-medium text-muted-foreground placeholder:text-muted-foreground/50 outline-none transition-colors flex-shrink-0"
          />
          <input
            type="text"
            placeholder="Feature name..."
            value={row.name}
            onChange={(e) => onChange({ ...row, name: e.target.value })}
            className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-border focus:border-primary text-sm font-semibold placeholder:text-muted-foreground/50 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
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
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
          {/* Score badges */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-3">
                <h4 className={`text-xs font-semibold uppercase tracking-wider ${categoryHeadingClasses[cat.key]} border-b border-border pb-2`}>
                  {cat.label}
                </h4>
                <div className="space-y-3">
                  {CRITERIA.filter((c) => c.category === cat.key).map((criterion) => {
                    const labels = criterion.inverted
                      ? (FEASIBILITY_LABELS[criterion.id] || INVERTED_SCORE_OPTIONS)
                      : (CRITERION_LABELS[criterion.id] || SCORE_OPTIONS);
                    return (
                      <div key={criterion.id} className="space-y-1">
                        <div className="flex items-center gap-1">
                          <label className="text-xs font-medium text-foreground/80">{criterion.label}</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button type="button" className="touch-manipulation">
                                <Info size={12} className="text-muted-foreground/60 hover:text-muted-foreground cursor-help flex-shrink-0" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="max-w-[220px] p-2 w-auto relative">
                              <PopoverClose className="absolute top-1 right-1 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <X size={12} />
                              </PopoverClose>
                              <p className="text-[11px] font-medium mb-1 pr-4">{criterion.label}</p>
                              <ul className="space-y-0.5">
                                {labels.map((opt) => (
                                  <li key={opt.value} className="text-[10px] text-muted-foreground">
                                    <span className="font-semibold text-foreground">{opt.value}</span> — {opt.label}
                                  </li>
                                ))}
                              </ul>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight min-h-[20px]">{criterion.description}</p>
                        <ScoreSelector
                          value={row.scores[criterion.id] ?? null}
                          onChange={(v) => updateScore(criterion.id, v)}
                          inverted={criterion.inverted}
                          criterionId={criterion.id}
                        />
                      </div>
                    );
                  })}
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
