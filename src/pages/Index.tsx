import { useState } from "react";
import { FeatureRow, createEmptyRow } from "@/lib/dvf-data";
import { exportToCSV } from "@/lib/export-csv";
import FeatureCard from "@/components/FeatureCard";
import DVFSummaryTable from "@/components/DVFSummaryTable";
import { Plus, Download } from "lucide-react";

const Index = () => {
  const [rows, setRows] = useState<FeatureRow[]>([createEmptyRow()]);

  const updateRow = (id: string, updated: FeatureRow) => {
    setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const deleteRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? [createEmptyRow()] : prev.filter((r) => r.id !== id)));
  };

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">DVF Prioritisation</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Desirability · Viability · Feasibility</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(rows)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Add Feature
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {rows.map((row, i) => (
          <FeatureCard
            key={row.id}
            row={row}
            index={i}
            onChange={(updated) => updateRow(row.id, updated)}
            onDelete={() => deleteRow(row.id)}
          />
        ))}

        <DVFSummaryTable rows={rows} />
      </main>
    </div>
  );
};

export default Index;
