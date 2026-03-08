import { FeatureRow, CRITERIA, calcTotal, calcCategoryTotal } from "@/lib/dvf-data";

export function exportToCSV(rows: FeatureRow[]) {
  const scored = rows.filter((r) => r.name.trim() !== "");
  if (scored.length === 0) return;

  const headers = [
    "Epic",
    "Feature",
    ...CRITERIA.map((c) => c.label),
    "Desirability Total",
    "Viability Total",
    "Feasibility Total",
    "Total",
  ];

  const csvRows = scored.map((row) => [
    row.epic,
    row.name,
    ...CRITERIA.map((c) => row.scores[c.id] ?? ""),
    calcCategoryTotal(row, "desirability"),
    calcCategoryTotal(row, "viability"),
    calcCategoryTotal(row, "feasibility"),
    calcTotal(row),
  ]);

  const csv = [headers, ...csvRows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dvf-prioritisation.csv";
  a.click();
  URL.revokeObjectURL(url);
}
