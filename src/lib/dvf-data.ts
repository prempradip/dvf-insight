export type ScoreValue = 0 | 5 | 8 | 13 | 21;

export interface Criterion {
  id: string;
  label: string;
  description: string;
  category: "desirability" | "viability" | "feasibility";
  inverted: boolean; // feasibility uses inverted scale
}

export const SCORE_OPTIONS: { value: ScoreValue; label: string }[] = [
  { value: 0, label: "No Impact" },
  { value: 5, label: "Minimal" },
  { value: 8, label: "Moderate" },
  { value: 13, label: "Strong" },
  { value: 21, label: "Critical" },
];

export const INVERTED_SCORE_OPTIONS: { value: ScoreValue; label: string }[] = [
  { value: 21, label: "Very Easy" },
  { value: 13, label: "Easy" },
  { value: 8, label: "Moderate" },
  { value: 5, label: "Hard" },
  { value: 0, label: "Very Hard" },
];

export const CRITERIA: Criterion[] = [
  { id: "student_needs", label: "Meet Student Needs", description: "Simplicity (student NPS)", category: "desirability", inverted: false },
  { id: "business_goals", label: "Meet Business Goals", description: "FY Strategy, lead creation, lead scoring, consistency, Business Scalability", category: "desirability", inverted: false },
  { id: "client_needs", label: "Meet Client Needs", description: "Lead Quality, Diversity, Conversion", category: "desirability", inverted: false },
  { id: "competitiveness", label: "Improve Competitiveness", description: "Brand recognition, Marketshare, Innovation", category: "desirability", inverted: false },
  { id: "revenue", label: "Revenue", description: "SP Volumes, Conversions", category: "viability", inverted: false },
  { id: "cost_optimisation", label: "Cost Optimisation", description: "Reduction in Cost of investment", category: "viability", inverted: false },
  { id: "efficiency", label: "Improve Efficiency", description: "Counsellor/Staff Productivity", category: "viability", inverted: false },
  { id: "enps", label: "Improve eNPS", description: "Staff Engagement", category: "viability", inverted: false },
  { id: "people", label: "People", description: "Team Capability", category: "feasibility", inverted: true },
  { id: "process_risk", label: "Process & Risk Reduction", description: "Risk & Incident Reduction", category: "feasibility", inverted: true },
  { id: "change_tech", label: "Change & Technology", description: "Change Adoption, Tech Capability", category: "feasibility", inverted: true },
  { id: "effort", label: "Effort", description: "Effort scale to card outcome implementation", category: "feasibility", inverted: true },
];

export interface FeatureRow {
  id: string;
  name: string;
  epic: string;
  scores: Record<string, ScoreValue | null>;
}

export function createEmptyRow(): FeatureRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    epic: "",
    scores: Object.fromEntries(CRITERIA.map((c) => [c.id, null])),
  };
}

export function calcTotal(row: FeatureRow): number {
  return Object.values(row.scores).reduce<number>((sum, v) => sum + (v ?? 0), 0);
}

export function calcCategoryTotal(row: FeatureRow, category: string): number {
  return CRITERIA.filter((c) => c.category === category).reduce<number>(
    (sum, c) => sum + (row.scores[c.id] ?? 0),
    0
  );
}
