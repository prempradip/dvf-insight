import { ScoreValue, SCORE_OPTIONS, INVERTED_SCORE_OPTIONS, CRITERION_LABELS } from "@/lib/dvf-data";

interface ScoreSelectorProps {
  value: ScoreValue | null;
  onChange: (value: ScoreValue) => void;
  inverted?: boolean;
  criterionId?: string;
}

const ScoreSelector = ({ value, onChange, inverted = false, criterionId }: ScoreSelectorProps) => {
  const options = inverted ? INVERTED_SCORE_OPTIONS : (criterionId && CRITERION_LABELS[criterionId]) || SCORE_OPTIONS;

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value) as ScoreValue)}
      className="w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm font-body text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors cursor-pointer"
    >
      <option value="" disabled>—</option>
      {options.map((opt) => (
        <option key={opt.label} value={opt.value}>
          {opt.value} · {opt.label}
        </option>
      ))}
    </select>
  );
};

export default ScoreSelector;
