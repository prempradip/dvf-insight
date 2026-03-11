import { useState, useCallback, useRef } from "react";

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Debounce: skip recording if last push was < 300ms ago
  const lastPush = useRef(0);

  const set = useCallback(
    (newPresent: T | ((prev: T) => T)) => {
      setState((prev) => {
        const resolved =
          typeof newPresent === "function"
            ? (newPresent as (p: T) => T)(prev.present)
            : newPresent;

        // If identical reference, skip
        if (resolved === prev.present) return prev;

        const now = Date.now();
        const debounced = now - lastPush.current < 300;
        lastPush.current = now;

        if (debounced) {
          // Replace present without pushing to past (merge rapid edits)
          return { ...prev, present: resolved, future: [] };
        }

        const past = [...prev.past, prev.present].slice(-maxHistory);
        return { past, present: resolved, future: [] };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const [newPresent, ...newFuture] = prev.future;
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
