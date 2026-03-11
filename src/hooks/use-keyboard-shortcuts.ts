import { useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface ShortcutHandlers {
  addItem: () => void;
  exportCSV: () => void;
  toggleDark: () => void;
  setTab: (tab: string) => void;
  toggleHelp: () => void;
}

export const SHORTCUTS = [
  { keys: "N", label: "Add feature / model", section: "Actions" },
  { keys: "E", label: "Export CSV", section: "Actions" },
  { keys: "D", label: "Toggle dark mode", section: "Actions" },
  { keys: "1", label: "DVF Scoring tab", section: "Navigation" },
  { keys: "2", label: "Financial Model tab", section: "Navigation" },
  { keys: "3", label: "Portfolio tab", section: "Navigation" },
  { keys: "?", label: "Show keyboard shortcuts", section: "Help" },
];

const TAB_MAP: Record<string, string> = {
  "1": "scoring",
  "2": "financial",
  "3": "portfolio",
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip when typing in inputs / textareas
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (key === "n") {
        e.preventDefault();
        handlers.addItem();
      } else if (key === "e") {
        e.preventDefault();
        handlers.exportCSV();
      } else if (key === "d") {
        e.preventDefault();
        handlers.toggleDark();
      } else if (key === "?" || (e.shiftKey && e.code === "Slash")) {
        e.preventDefault();
        handlers.toggleHelp();
      } else if (TAB_MAP[key]) {
        e.preventDefault();
        handlers.setTab(TAB_MAP[key]);
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
