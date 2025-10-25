import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Medication,
  MedicationLog,
  MedicationAdherence,
  MedicationReminder,
  Supplement,
} from "@/types/medication";
import { dbManager, STORES } from "@/lib/db";

interface MedicationState {
  // State
  medications: Medication[];
  logs: MedicationLog[];
  adherence: MedicationAdherence[];
  reminders: MedicationReminder[];
  supplements: Supplement[];
  isLoading: boolean;
  error: string | null;
  _isHydrated: boolean;

  // Actions - Medications
  fetchMedications: () => Promise<void>;
  addMedication: (
    medication: Omit<Medication, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  toggleMedicationActive: (id: string) => Promise<void>;

  // Actions - Medication Logs
  fetchLogs: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchTodaySchedule: () => Promise<MedicationLog[]>;
  logIntake: (
    medicationId: string,
    scheduledTime: Date,
    status: "taken" | "skipped",
    notes?: string,
    skipReason?: string
  ) => Promise<void>;
  updateLog: (id: string, updates: Partial<MedicationLog>) => Promise<void>;
  getLogsByMedication: (
    medicationId: string,
    startDate?: Date,
    endDate?: Date
  ) => Promise<MedicationLog[]>;

  // Actions - Adherence
  calculateAdherence: (
    medicationId: string,
    startDate: Date,
    endDate: Date
  ) => Promise<MedicationAdherence>;
  fetchAdherence: (medicationId?: string) => Promise<void>;

  // Actions - Reminders
  fetchReminders: () => Promise<void>;
  dismissReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes: number) => Promise<void>;

  // Actions - Supplements
  fetchSupplements: () => Promise<void>;
  addSupplement: (
    supplement: Omit<Supplement, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateSupplement: (id: string, updates: Partial<Supplement>) => Promise<void>;
  deleteSupplement: (id: string) => Promise<void>;

  // Analytics
  getOverallAdherence: (startDate: Date, endDate: Date) => Promise<number>;
  getLowInventoryMedications: () => Medication[];
  getMissedDoses: (date: Date) => Promise<MedicationLog[]>;

  // Utilities
  clearError: () => void;
  initializeStore: () => Promise<void>;
  _setHydrated: (hydrated: boolean) => void;
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      // Initial state
      medications: [],
      logs: [],
      adherence: [],
      reminders: [],
      supplements: [],
      isLoading: false,
      error: null,
      _isHydrated: false,

      // Set hydration status
      _setHydrated: (hydrated: boolean) => set({ _isHydrated: hydrated }),

      // Initialize store
      initializeStore: async () => {
        // Skip during SSR
        if (typeof window === "undefined") {
          return;
        }

        set({ isLoading: true });

        try {
          await get().fetchMedications();
          await get().fetchTodaySchedule();
          await get().fetchSupplements();

          set({ isLoading: false, _isHydrated: true });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize medication store",
            isLoading: false,
            _isHydrated: true,
          });
        }
      },

      // Fetch all medications
      fetchMedications: async () => {
        // Skip during SSR
        if (typeof window === "undefined") {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const store = await dbManager.getStore<Medication>(
            STORES.MEDICATIONS
          );
          if (!store) {
            set({ medications: [], isLoading: false });
            return;
          }

          const medications = await store.getAllByIndex("userId", "user-1");

          // Sort by active first, then by name
          medications.sort((a, b) => {
            if (a.active !== b.active) return a.active ? -1 : 1;
            return a.name.localeCompare(b.name);
          });

          set({ medications, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch medications",
            isLoading: false,
          });
        }
      },

      // Add medication
      addMedication: async (medication) => {
        set({ isLoading: true, error: null });

        try {
          const newMedication: Medication = {
            ...medication,
            id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const store = await dbManager.getStore<Medication>(
            STORES.MEDICATIONS
          );
          if (!store) {
            set({ isLoading: false });
            return;
          }

          await store.add(newMedication);

          set((state) => ({
            medications: [newMedication, ...state.medications],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to add medication",
            isLoading: false,
          });
        }
      },

      // Update medication
      updateMedication: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          const store = await dbManager.getStore<Medication>(
            STORES.MEDICATIONS
          );
          if (!store) {
            set({ isLoading: false });
            return;
          }

          const existing = await store.get(id);

          if (!existing) {
            throw new Error("Medication not found");
          }

          const updated: Medication = {
            ...existing,
            ...updates,
            updatedAt: new Date(),
          };
          await store.put(updated);

          set((state) => ({
            medications: state.medications.map((m) =>
              m.id === id ? updated : m
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update medication",
            isLoading: false,
          });
        }
      },

      // Delete medication
      deleteMedication: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const store = await dbManager.getStore<Medication>(
            STORES.MEDICATIONS
          );
          if (!store) {
            set({ isLoading: false });
            return;
          }

          await store.delete(id);

          set((state) => ({
            medications: state.medications.filter((m) => m.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete medication",
            isLoading: false,
          });
        }
      },

      // Toggle medication active status
      toggleMedicationActive: async (id) => {
        const medication = get().medications.find((m) => m.id === id);
        if (!medication) return;

        await get().updateMedication(id, { active: !medication.active });
      },

      // Fetch logs
      fetchLogs: async (startDate, endDate) => {
        set({ isLoading: true, error: null });

        try {
          const store = await dbManager.getStore<MedicationLog>(
            STORES.MEDICATION_LOGS
          );
          if (!store) {
            set({ logs: [], isLoading: false });
            return;
          }

          let logs: MedicationLog[];

          if (startDate && endDate) {
            const range = IDBKeyRange.bound(
              ["user-1", startDate],
              ["user-1", endDate]
            );
            logs = await store.getAllByIndex("userId_scheduledTime", range);
          } else {
            logs = await store.getAllByIndex("userId", "user-1");
          }

          // Sort by scheduled time descending
          logs.sort(
            (a, b) =>
              new Date(b.scheduledTime).getTime() -
              new Date(a.scheduledTime).getTime()
          );

          set({ logs, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch medication logs",
            isLoading: false,
          });
        }
      },

      // Fetch today's schedule
      fetchTodaySchedule: async () => {
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const store = await dbManager.getStore<MedicationLog>(
            STORES.MEDICATION_LOGS
          );
          if (!store) return [];

          const range = IDBKeyRange.bound(
            ["user-1", today],
            ["user-1", tomorrow]
          );
          const logs = await store.getAllByIndex("userId_scheduledTime", range);

          // Sort by scheduled time ascending
          logs.sort(
            (a, b) =>
              new Date(a.scheduledTime).getTime() -
              new Date(b.scheduledTime).getTime()
          );

          set({ logs });
          return logs;
        } catch (error) {
          console.error("Failed to fetch today's schedule:", error);
          return [];
        }
      },

      // Log medication intake
      logIntake: async (
        medicationId,
        scheduledTime,
        status,
        notes,
        skipReason
      ) => {
        set({ isLoading: true, error: null });

        try {
          const newLog: MedicationLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: "user-1",
            medicationId,
            scheduledTime,
            actualTime: status === "taken" ? new Date() : undefined,
            status,
            skipReason,
            notes,
            createdAt: new Date(),
          };

          const store = await dbManager.getStore<MedicationLog>(
            STORES.MEDICATION_LOGS
          );
          if (!store) {
            set({ isLoading: false });
            return;
          }

          await store.add(newLog);

          set((state) => ({
            logs: [newLog, ...state.logs],
            isLoading: false,
          }));

          // Update inventory if taken
          if (status === "taken") {
            const medication = get().medications.find(
              (m) => m.id === medicationId
            );
            if (medication?.inventory) {
              await get().updateMedication(medicationId, {
                inventory: {
                  ...medication.inventory,
                  current: Math.max(0, medication.inventory.current - 1),
                },
              });
            }
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to log medication intake",
            isLoading: false,
          });
        }
      },

      // Update log
      updateLog: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          const store = await dbManager.getStore<MedicationLog>(
            STORES.MEDICATION_LOGS
          );
          if (!store) {
            set({ isLoading: false });
            return;
          }

          const existing = await store.get(id);

          if (!existing) {
            throw new Error("Medication log not found");
          }

          const updated: MedicationLog = { ...existing, ...updates };
          await store.put(updated);

          set((state) => ({
            logs: state.logs.map((l) => (l.id === id ? updated : l)),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update medication log",
            isLoading: false,
          });
        }
      },

      // Get logs by medication
      getLogsByMedication: async (medicationId, startDate, endDate) => {
        try {
          const store = await dbManager.getStore<MedicationLog>(
            STORES.MEDICATION_LOGS
          );
          if (!store) return [];

          let logs = await store.getAllByIndex("userId", "user-1");

          // Filter by medication ID
          logs = logs.filter((log) => log.medicationId === medicationId);

          // Filter by date range if provided
          if (startDate && endDate) {
            logs = logs.filter((log) => {
              const logDate = new Date(log.scheduledTime);
              return logDate >= startDate && logDate <= endDate;
            });
          }

          return logs;
        } catch (error) {
          console.error("Failed to get logs by medication:", error);
          return [];
        }
      },

      // Calculate adherence
      calculateAdherence: async (medicationId, startDate, endDate) => {
        try {
          const logs = await get().getLogsByMedication(
            medicationId,
            startDate,
            endDate
          );

          const scheduled = logs.length;
          const taken = logs.filter((l) => l.status === "taken").length;
          const skipped = logs.filter((l) => l.status === "skipped").length;
          const missed = logs.filter((l) => l.status === "missed").length;

          const adherenceRate = scheduled > 0 ? (taken / scheduled) * 100 : 0;

          // Calculate patterns
          const takenLogs = logs.filter((l) => l.status === "taken");
          const skipReasons = logs
            .filter((l) => l.skipReason)
            .map((l) => l.skipReason!);

          const adherence: MedicationAdherence = {
            userId: "user-1",
            medicationId,
            period: { start: startDate, end: endDate },
            stats: {
              scheduled,
              taken,
              skipped,
              missed,
              adherenceRate: Math.round(adherenceRate),
            },
            patterns: {
              commonSkipReasons: Array.from(new Set(skipReasons)).slice(0, 3),
            },
            calculatedAt: new Date(),
          };

          return adherence;
        } catch (error) {
          console.error("Failed to calculate adherence:", error);
          throw error;
        }
      },

      // Fetch adherence
      fetchAdherence: async (medicationId) => {
        set({ isLoading: true, error: null });

        try {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Last 30 days

          if (medicationId) {
            const adherence = await get().calculateAdherence(
              medicationId,
              startDate,
              endDate
            );
            set((state) => ({
              adherence: [adherence],
              isLoading: false,
            }));
          } else {
            // Calculate for all active medications
            const activeMedications = get().medications.filter((m) => m.active);
            const adherenceData = await Promise.all(
              activeMedications.map((m) =>
                get().calculateAdherence(m.id, startDate, endDate)
              )
            );
            set({ adherence: adherenceData, isLoading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch adherence",
            isLoading: false,
          });
        }
      },

      // Fetch reminders
      fetchReminders: async () => {
        set({ isLoading: true, error: null });

        try {
          // Reminders stored in memory for now
          // In production, would use notifications API
          set({ reminders: [], isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch reminders",
            isLoading: false,
          });
        }
      },

      // Dismiss reminder
      dismissReminder: async (id) => {
        set({ isLoading: true, error: null });

        try {
          set((state) => ({
            reminders: state.reminders.filter((r) => r.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to dismiss reminder",
            isLoading: false,
          });
        }
      },

      // Snooze reminder
      snoozeReminder: async (id, minutes) => {
        set({ isLoading: true, error: null });

        try {
          const snoozeUntil = new Date();
          snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);

          set((state) => ({
            reminders: state.reminders.map((r) =>
              r.id === id
                ? {
                    ...r,
                    snoozed: true,
                    snoozeUntil,
                    snoozeCount: r.snoozeCount + 1,
                  }
                : r
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to snooze reminder",
            isLoading: false,
          });
        }
      },

      // Fetch supplements
      fetchSupplements: async () => {
        set({ isLoading: true, error: null });

        try {
          // Supplements stored in memory for now
          // Could be added to a separate IndexedDB store
          set({ supplements: [], isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch supplements",
            isLoading: false,
          });
        }
      },

      // Add supplement
      addSupplement: async (supplement) => {
        set({ isLoading: true, error: null });

        try {
          const newSupplement: Supplement = {
            ...supplement,
            id: `supp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            supplements: [newSupplement, ...state.supplements],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to add supplement",
            isLoading: false,
          });
        }
      },

      // Update supplement
      updateSupplement: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          set((state) => ({
            supplements: state.supplements.map((s) =>
              s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update supplement",
            isLoading: false,
          });
        }
      },

      // Delete supplement
      deleteSupplement: async (id) => {
        set({ isLoading: true, error: null });

        try {
          set((state) => ({
            supplements: state.supplements.filter((s) => s.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete supplement",
            isLoading: false,
          });
        }
      },

      // Get overall adherence
      getOverallAdherence: async (startDate, endDate) => {
        try {
          const activeMedications = get().medications.filter((m) => m.active);

          if (activeMedications.length === 0) return 0;

          const adherenceData = await Promise.all(
            activeMedications.map((m) =>
              get().calculateAdherence(m.id, startDate, endDate)
            )
          );

          const totalRate = adherenceData.reduce(
            (sum, a) => sum + a.stats.adherenceRate,
            0
          );
          return Math.round(totalRate / adherenceData.length);
        } catch (error) {
          console.error("Failed to get overall adherence:", error);
          return 0;
        }
      },

      // Get low inventory medications
      getLowInventoryMedications: () => {
        return get().medications.filter(
          (m) =>
            m.active &&
            m.inventory &&
            m.inventory.current <= m.inventory.lowThreshold
        );
      },

      // Get missed doses
      getMissedDoses: async (date) => {
        try {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          const store = await dbManager.getStore<MedicationLog>(
            STORES.MEDICATION_LOGS
          );
          if (!store) return [];

          const range = IDBKeyRange.bound(
            ["user-1", startOfDay],
            ["user-1", endOfDay]
          );
          const logs = await store.getAllByIndex("userId_scheduledTime", range);

          return logs.filter((l) => l.status === "missed");
        } catch (error) {
          console.error("Failed to get missed doses:", error);
          return [];
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "medication-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        medications: state.medications,
        logs: state.logs,
        adherence: state.adherence,
        reminders: state.reminders,
        supplements: state.supplements,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("[Medication Store] Hydration error:", error);
          } else if (state) {
            console.log("[Medication Store] Hydrated successfully");
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
