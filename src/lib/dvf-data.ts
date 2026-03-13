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

// Criterion-specific labels for Desirability & Viability
export const CRITERION_LABELS: Record<string, { value: ScoreValue; label: string }[]> = {
  student_needs: [
    { value: 0, label: "No Student Benefit" },
    { value: 5, label: "Nice to Have" },
    { value: 8, label: "Improves Experience" },
    { value: 13, label: "High Satisfaction Driver" },
    { value: 21, label: "Must-Have for Students" },
  ],
  business_goals: [
    { value: 0, label: "No Strategic Fit" },
    { value: 5, label: "Loosely Aligned" },
    { value: 8, label: "Supports a KPI" },
    { value: 13, label: "Drives Key Strategy" },
    { value: 21, label: "Mission-Critical" },
  ],
  client_needs: [
    { value: 0, label: "No Client Value" },
    { value: 5, label: "Minor Improvement" },
    { value: 8, label: "Boosts Lead Quality" },
    { value: 13, label: "Strong Conversion Lift" },
    { value: 21, label: "Transformative for Clients" },
  ],
  competitiveness: [
    { value: 0, label: "No Market Impact" },
    { value: 5, label: "Keeps Parity" },
    { value: 8, label: "Slight Edge" },
    { value: 13, label: "Clear Differentiator" },
    { value: 21, label: "Category-Defining" },
  ],
  revenue: [
    { value: 0, label: "No Revenue Effect" },
    { value: 5, label: "Marginal Uplift" },
    { value: 8, label: "Measurable Growth" },
    { value: 13, label: "Significant Revenue Driver" },
    { value: 21, label: "Step-Change in Revenue" },
  ],
  cost_optimisation: [
    { value: 0, label: "No Cost Saving" },
    { value: 5, label: "Minor Saving" },
    { value: 8, label: "Noticeable Reduction" },
    { value: 13, label: "Major Cost Avoidance" },
    { value: 21, label: "Eliminates Cost Centre" },
  ],
  efficiency: [
    { value: 0, label: "No Productivity Gain" },
    { value: 5, label: "Saves Minutes" },
    { value: 8, label: "Saves Hours Weekly" },
    { value: 13, label: "Frees Up Headcount" },
    { value: 21, label: "Fully Automates Process" },
  ],
  enps: [
    { value: 0, label: "No Engagement Impact" },
    { value: 5, label: "Slight Morale Boost" },
    { value: 8, label: "Reduces Friction" },
    { value: 13, label: "Staff Advocacy Driver" },
    { value: 21, label: "Culture-Shaping" },
  ],
};

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
