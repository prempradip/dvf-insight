import { useState, useEffect, useCallback } from "react";
import { FeatureRow, createEmptyRow } from "@/lib/dvf-data";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import { FinancialInputs, createEmptyFinancialInput } from "@/lib/financial-calc";
import { exportToCSV } from "@/lib/export-csv";
import SortableFeatureCard from "@/components/SortableFeatureCard";
import DVFSummaryTable from "@/components/DVFSummaryTable";
import FinancialModelCard from "@/components/FinancialModelCard";
import FinancialSummaryTable from "@/components/FinancialSummaryTable";
import PortfolioView from "@/components/PortfolioView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Download, Moon, Sun, Keyboard, Undo2, Redo2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WelcomeModal from "@/components/WelcomeModal";
import KeyboardShortcutsDialog from "@/components/KeyboardShortcutsDialog";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const STORAGE_KEY = "dvf-calculator-rows";
const FIN_STORAGE_KEY = "dvf-financial-inputs";

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

function loadFinancials(): FinancialInputs[] {
  try {
    const saved = localStorage.getItem(FIN_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [createEmptyFinancialInput("", "")];
}

const Index = () => {
  const { state: rows, set: setRows, undo: undoRows, redo: redoRows, canUndo: canUndoRows, canRedo: canRedoRows } = useUndoRedo<FeatureRow[]>(loadRows());
  const { state: financials, set: setFinancials, undo: undoFin, redo: redoFin, canUndo: canUndoFin, canRedo: canRedoFin } = useUndoRedo<FinancialInputs[]>(loadFinancials());
  const [activeTab, setActiveTab] = useState("scoring");
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dvf-dark-mode");
      if (saved !== null) return saved === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((prev) => {
        const oldIndex = prev.findIndex((r) => r.id === active.id);
        const newIndex = prev.findIndex((r) => r.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dvf-dark-mode", String(dark));
  }, [dark]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem(FIN_STORAGE_KEY, JSON.stringify(financials));
  }, [financials]);

  useEffect(() => {
    setFinancials((prev) => {
      const namedRows = rows.filter((r) => r.name.trim() !== "");
      const existingByFeatureId = new Map(prev.filter((f) => f.featureId).map((f) => [f.featureId, f]));

      // Build synced list: update names for existing, create new for missing
      const synced = namedRows.map((row) => {
        const existing = existingByFeatureId.get(row.id);
        if (existing) {
          return existing.featureName !== row.name ? { ...existing, featureName: row.name } : existing;
        }
        return createEmptyFinancialInput(row.id, row.name);
      });

      // Keep manually-added models (no featureId) at the end
      const manual = prev.filter((f) => !f.featureId);

      const result = [...synced, ...manual];
      return result.length > 0 ? result : [createEmptyFinancialInput("", "")];
    });
  }, [rows]);

  const updateRow = (id: string, updated: FeatureRow) => {
    setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const deleteRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? [createEmptyRow()] : prev.filter((r) => r.id !== id)));
  };

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);

  const updateFinancial = (id: string, updated: FinancialInputs) => {
    setFinancials((prev) => prev.map((f) => (f.id === id ? updated : f)));
  };

  const deleteFinancial = (id: string) => {
    setFinancials((prev) =>
      prev.length === 1 ? [createEmptyFinancialInput("", "")] : prev.filter((f) => f.id !== id)
    );
  };

  const addFinancial = () =>
    setFinancials((prev) => [...prev, createEmptyFinancialInput("", "")]);

  const handleUndo = useCallback(() => {
    if (activeTab === "scoring" && canUndoRows) { undoRows(); toast({ title: "Undo", description: "Reverted scoring change" }); }
    else if (activeTab === "financial" && canUndoFin) { undoFin(); toast({ title: "Undo", description: "Reverted financial change" }); }
  }, [activeTab, canUndoRows, canUndoFin, undoRows, undoFin]);

  const handleRedo = useCallback(() => {
    if (activeTab === "scoring" && canRedoRows) { redoRows(); toast({ title: "Redo", description: "Re-applied scoring change" }); }
    else if (activeTab === "financial" && canRedoFin) { redoFin(); toast({ title: "Redo", description: "Re-applied financial change" }); }
  }, [activeTab, canRedoRows, canRedoFin, redoRows, redoFin]);

  // Ctrl+Z / Ctrl+Shift+Z global listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo]);

  useKeyboardShortcuts({
    addItem: () => (activeTab === "scoring" ? addRow() : activeTab === "financial" ? addFinancial() : undefined),
    exportCSV: () => exportToCSV(rows),
    toggleDark: () => setDark((d) => !d),
    setTab: setActiveTab,
    toggleHelp: () => setShowShortcuts((s) => !s),
  });

  return (
    <div className="min-h-screen bg-background">
      <WelcomeModal />
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
      <header className="sticky top-0 z-10 border-b border-border/50" style={{ background: 'var(--gradient-header)' }}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-shrink-0">
            <h1 className="font-display text-base sm:text-xl font-bold tracking-tight text-white">Value Matrix</h1>
            <p className="text-[9px] sm:text-xs text-white/50 mt-0.5 hidden sm:block">DVF · DCF — Prioritise & Model</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap justify-end">
            <button
              onClick={handleUndo}
              disabled={activeTab === "scoring" ? !canUndoRows : activeTab === "financial" ? !canUndoFin : true}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/10 w-8 h-8 sm:w-9 sm:h-9 text-white/80 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={handleRedo}
              disabled={activeTab === "scoring" ? !canRedoRows : activeTab === "financial" ? !canRedoFin : true}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/10 w-8 h-8 sm:w-9 sm:h-9 text-white/80 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={14} />
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/10 w-9 h-9 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Keyboard shortcuts"
            >
              <Keyboard size={16} />
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/10 w-8 h-8 sm:w-9 sm:h-9 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {(activeTab === "scoring" || activeTab === "portfolio") && (
              <button
                onClick={() => exportToCSV(rows)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
            {activeTab !== "portfolio" && (
              <button
                onClick={activeTab === "scoring" ? addRow : addFinancial}
                className="inline-flex items-center gap-1 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-white transition-colors glow-primary"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">
                  {activeTab === "scoring" ? "Add Feature" : "Add Model"}
                </span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="scoring">DVF Scoring</TabsTrigger>
            <TabsTrigger value="financial">Financial Model</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="scoring" className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {rows.map((row, i) => (
                    <SortableFeatureCard
                      key={row.id}
                      row={row}
                      index={i}
                      onChange={(updated) => updateRow(row.id, updated)}
                      onDelete={() => deleteRow(row.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <DVFSummaryTable rows={rows} />
            <button
              onClick={addRow}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus size={16} />
              Add Feature
            </button>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            {financials.map((fin, i) => (
              <FinancialModelCard
                key={fin.id}
                input={fin}
                index={i}
                onChange={(updated) => updateFinancial(fin.id, updated)}
                onDelete={() => deleteFinancial(fin.id)}
              />
            ))}
            <FinancialSummaryTable inputs={financials} />
            <button
              onClick={addFinancial}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus size={16} />
              Add Model
            </button>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <PortfolioView rows={rows} financials={financials} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
