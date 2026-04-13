import { useState, useCallback } from "react";

const STORAGE_KEY = "jee-progress";

const getStored = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const useProgress = () => {
  const [completed, setCompleted] = useState<string[]>(getStored);

  const toggleComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isCompleted = useCallback((id: string) => completed.includes(id), [completed]);

  const progressPercent = useCallback(
    (total: number) => (total === 0 ? 0 : Math.round((completed.length / total) * 100)),
    [completed]
  );

  return { completed, toggleComplete, isCompleted, progressPercent, completedCount: completed.length };
};
