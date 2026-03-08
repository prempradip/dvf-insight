import { useState, useEffect, useCallback } from "react";
import { FeatureRow, createEmptyRow } from "@/lib/dvf-data";
import { exportToCSV } from "@/lib/export-csv";
import FeatureCard from "@/components/FeatureCard";
import DVFSummaryTable from "@/components/DVFSummaryTable";
import { Plus, Download } from "lucide-react";

const STORAGE_KEY = "dvf-calculator-rows";

function loadRows(): FeatureRow[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [createEmptyRow()];
}

const Index = () => {
  const [rows, setRows] = useState<FeatureRow[]>(loadRows);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);


    setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const deleteRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? [createEmptyRow()] : prev.filter((r) => r.id !== id)));
  };

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight">DVF Prioritisation</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Desirability · Viability · Feasibility</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => exportToCSV(rows)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Feature</span>
              <span className="sm:hidden">Add</span>
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
