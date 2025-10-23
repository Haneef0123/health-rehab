import { create } from "zustand";
import type { PainLog, PainAnalytics } from "@/types/pain";

interface PainState {
  // State
  logs: PainLog[];
  currentPainLevel: number;
  analytics: PainAnalytics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addLog: (log: Omit<PainLog, "id" | "createdAt">) => Promise<void>;
  updateLog: (id: string, updates: Partial<PainLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  fetchLogs: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchAnalytics: (period: "week" | "month" | "year") => Promise<void>;
  setCurrentPainLevel: (level: number) => void;
  clearError: () => void;
}

export const usePainStore = create<PainState>((set, get) => ({
  // Initial state
  logs: [],
  currentPainLevel: 0,
  analytics: null,
  isLoading: false,
  error: null,

  // Add pain log
  addLog: async (log) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Call actual API endpoint
      const response = await fetch("/api/pain/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      });

      if (!response.ok) {
        throw new Error("Failed to add pain log");
      }

      const newLog = await response.json();

      set((state) => ({
        logs: [newLog, ...state.logs],
        currentPainLevel: newLog.level,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add pain log",
        isLoading: false,
      });
    }
  },

  // Update pain log
  updateLog: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Call actual API endpoint
      const response = await fetch(`/api/pain/logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update pain log");
      }

      const updatedLog = await response.json();

      set((state) => ({
        logs: state.logs.map((log) => (log.id === id ? updatedLog : log)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update pain log",
        isLoading: false,
      });
    }
  },

  // Delete pain log
  deleteLog: async (id) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Call actual API endpoint
      const response = await fetch(`/api/pain/logs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete pain log");
      }

      set((state) => ({
        logs: state.logs.filter((log) => log.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete pain log",
        isLoading: false,
      });
    }
  },

  // Fetch pain logs
  fetchLogs: async (startDate, endDate) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate.toISOString());
      if (endDate) params.append("end", endDate.toISOString());

      // TODO: Call actual API endpoint
      const response = await fetch(`/api/pain/logs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch pain logs");
      }

      const logs = await response.json();

      set({
        logs,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch pain logs",
        isLoading: false,
      });
    }
  },

  // Fetch analytics
  fetchAnalytics: async (period) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Call actual API endpoint
      const response = await fetch(`/api/pain/analytics?period=${period}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const analytics = await response.json();

      set({
        analytics,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch analytics",
        isLoading: false,
      });
    }
  },

  // Set current pain level (quick update)
  setCurrentPainLevel: (level) => {
    set({ currentPainLevel: level });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
