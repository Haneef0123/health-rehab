import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PainLog, PainAnalytics } from "@/types/pain";
import { dbManager, STORES } from "@/lib/db";

interface PainState {
  // State
  logs: PainLog[];
  currentPainLevel: number;
  analytics: PainAnalytics | null;
  isLoading: boolean;
  error: string | null;
  _isHydrated: boolean;

  // Actions
  addLog: (log: Omit<PainLog, "id" | "createdAt">) => Promise<void>;
  updateLog: (id: string, updates: Partial<PainLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  fetchLogs: (startDate?: Date, endDate?: Date) => Promise<void>;
  getLogsByDateRange: (startDate: Date, endDate: Date) => Promise<PainLog[]>;
  fetchAnalytics: (period: "week" | "month" | "year") => Promise<void>;
  setCurrentPainLevel: (level: number) => void;
  clearError: () => void;
  initializeStore: () => Promise<void>;
  _setHydrated: (hydrated: boolean) => void;
}

export const usePainStore = create<PainState>()(
  persist(
    (set, get) => ({
      // Initial state
      logs: [],
      currentPainLevel: 0,
      analytics: null,
      isLoading: false,
      error: null,
      _isHydrated: false,

      // Set hydration status
      _setHydrated: (hydrated: boolean) => set({ _isHydrated: hydrated }),

      // Initialize store from IndexedDB
      initializeStore: async () => {
        // Skip during SSR
        if (typeof window === "undefined") {
          return;
        }

        set({ isLoading: true });

        try {
          const store = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
          if (!store) {
            set({ logs: [], isLoading: false, _isHydrated: true });
            return;
          }

          const logs = await store.getAllByIndex("userId", "user-1");

          // Sort by timestamp descending
          const sortedLogs = logs.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          // Get most recent pain level
          const currentLevel = sortedLogs[0]?.level || 0;

          set({
            logs: sortedLogs,
            currentPainLevel: currentLevel,
            isLoading: false,
            _isHydrated: true,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load pain logs",
            isLoading: false,
            _isHydrated: true,
          });
        }
      },

      // Add pain log
      addLog: async (log) => {
        set({ isLoading: true, error: null });

        try {
          const newLog: PainLog = {
            ...log,
            id: `pain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: "user-1",
            createdAt: new Date(),
          };

          // Save to IndexedDB
          const store = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
          if (!store) {
            set({ isLoading: false });
            return;
          }

          await store.add(newLog);

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
          const store = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
          if (!store) {
            set({ isLoading: false });
            return;
          }

          const existingLog = await store.get(id);

          if (!existingLog) {
            throw new Error("Pain log not found");
          }

          const updatedLog: PainLog = {
            ...existingLog,
            ...updates,
          };

          await store.put(updatedLog);

          set((state) => ({
            logs: state.logs.map((log) => (log.id === id ? updatedLog : log)),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update pain log",
            isLoading: false,
          });
        }
      },

      // Delete pain log
      deleteLog: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const store = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
          if (!store) {
            set({ isLoading: false });
            return;
          }

          await store.delete(id);

          set((state) => ({
            logs: state.logs.filter((log) => log.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete pain log",
            isLoading: false,
          });
        }
      },

      // Fetch logs (with optional date range)
      fetchLogs: async (startDate?: Date, endDate?: Date) => {
        set({ isLoading: true, error: null });

        try {
          const store = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
          if (!store) {
            set({ logs: [], isLoading: false });
            return;
          }

          let logs: PainLog[];

          if (startDate && endDate) {
            // Query by date range using compound index
            const range = IDBKeyRange.bound(
              ["user-1", startDate],
              ["user-1", endDate]
            );
            logs = await store.getAllByIndex("userId_timestamp", range);
          } else {
            // Get all logs for user
            logs = await store.getAllByIndex("userId", "user-1");
          }

          // Sort by timestamp descending
          const sortedLogs = logs.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          set({
            logs: sortedLogs,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch pain logs",
            isLoading: false,
          });
        }
      },

      // Get logs by date range (helper method)
      getLogsByDateRange: async (startDate: Date, endDate: Date) => {
        try {
          const store = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
          if (!store) return [];

          const range = IDBKeyRange.bound(
            ["user-1", startDate],
            ["user-1", endDate]
          );
          const logs = await store.getAllByIndex("userId_timestamp", range);
          return logs;
        } catch (error) {
          console.error("Failed to get logs by date range:", error);
          return [];
        }
      },

      // Fetch analytics
      fetchAnalytics: async (period: "week" | "month" | "year") => {
        set({ isLoading: true, error: null });

        try {
          const now = new Date();
          const startDate = new Date(now);

          // Calculate start date based on period
          switch (period) {
            case "week":
              startDate.setDate(now.getDate() - 7);
              break;
            case "month":
              startDate.setMonth(now.getMonth() - 1);
              break;
            case "year":
              startDate.setFullYear(now.getFullYear() - 1);
              break;
          }

          // Get logs for period
          const logs = await get().getLogsByDateRange(startDate, now);

          if (logs.length === 0) {
            set({
              analytics: {
                userId: "user-1",
                period: { start: startDate, end: now },
                average: 0,
                highest: 0,
                lowest: 0,
                trend: "stable",
                commonLocations: [],
                commonTypes: [],
                commonTriggers: [],
                timeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
                activityCorrelation: [],
              },
              isLoading: false,
            });
            return;
          }

          // Calculate summary stats
          const levels = logs.map((l) => l.level);
          const average = levels.reduce((sum, l) => sum + l, 0) / levels.length;
          const highest = Math.max(...levels);
          const lowest = Math.min(...levels);

          // Calculate trend (first half vs second half)
          const midPoint = Math.floor(logs.length / 2);
          const firstHalf = logs.slice(0, midPoint);
          const secondHalf = logs.slice(midPoint);

          const firstAvg =
            firstHalf.reduce((sum, log) => sum + log.level, 0) /
            firstHalf.length;
          const secondAvg =
            secondHalf.reduce((sum, log) => sum + log.level, 0) /
            secondHalf.length;
          const trendValue = secondAvg - firstAvg;
          const trend: "improving" | "stable" | "worsening" =
            trendValue < -0.5
              ? "improving"
              : trendValue > 0.5
              ? "worsening"
              : "stable";

          // Common locations
          const locationCounts = new Map<string, number>();
          logs.forEach((log) => {
            log.location.forEach((loc) => {
              locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
            });
          });
          const commonLocations = Array.from(locationCounts.entries())
            .map(([location, count]) => ({ location: location as any, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Common types
          const typeCounts = new Map<string, number>();
          logs.forEach((log) => {
            log.type.forEach((t) => {
              typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
            });
          });
          const commonTypes = Array.from(typeCounts.entries())
            .map(([type, count]) => ({ type: type as any, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Common triggers
          const triggerCounts = new Map<string, number>();
          logs.forEach((log) => {
            log.triggers?.forEach((trigger) => {
              triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + 1);
            });
          });
          const commonTriggers = Array.from(triggerCounts.entries())
            .map(([trigger, count]) => ({ trigger, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Time of day patterns
          const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
          logs.forEach((log) => {
            const hour = new Date(log.timestamp).getHours();
            if (hour >= 6 && hour < 12) timeOfDay.morning++;
            else if (hour >= 12 && hour < 18) timeOfDay.afternoon++;
            else if (hour >= 18 && hour < 22) timeOfDay.evening++;
            else timeOfDay.night++;
          });

          // Activity correlation
          const activityCounts = new Map<
            string,
            { sum: number; count: number }
          >();
          logs.forEach((log) => {
            if (log.activity) {
              const existing = activityCounts.get(log.activity) || {
                sum: 0,
                count: 0,
              };
              activityCounts.set(log.activity, {
                sum: existing.sum + log.level,
                count: existing.count + 1,
              });
            }
          });
          const activityCorrelation = Array.from(activityCounts.entries())
            .map(([activity, data]) => ({
              activity,
              averagePain: data.sum / data.count,
              occurrences: data.count,
            }))
            .sort((a, b) => b.averagePain - a.averagePain)
            .slice(0, 10);

          const analytics: PainAnalytics = {
            userId: "user-1",
            period: { start: startDate, end: now },
            average: Math.round(average * 10) / 10,
            highest,
            lowest,
            trend,
            commonLocations,
            commonTypes,
            commonTriggers,
            timeOfDay,
            activityCorrelation,
          };

          set({
            analytics,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to calculate analytics",
            isLoading: false,
          });
        }
      },

      // Set current pain level
      setCurrentPainLevel: (level: number) => {
        set({ currentPainLevel: level });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "pain-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        logs: state.logs,
        currentPainLevel: state.currentPainLevel,
        analytics: state.analytics,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("[Pain Store] Hydration error:", error);
          } else if (state) {
            console.log("[Pain Store] Hydrated successfully");
            state._setHydrated(true);
            // Auto-initialize from IndexedDB after hydration
            if (typeof window !== "undefined") {
              state.initializeStore();
            }
          }
        };
      },
    }
  )
);
