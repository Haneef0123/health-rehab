import { create } from "zustand";
import type {
  Meal,
  DietLog,
  WaterLog,
  MealPlan,
  FastingSchedule,
  DietaryRestrictions,
} from "@/types/diet";
import { dbManager, STORES } from "@/lib/db";
import { filterMeals, filterWaterLogs } from "@/lib/type-guards";

interface DietState {
  // State
  meals: Meal[];
  dietLogs: DietLog[];
  waterLogs: WaterLog[];
  mealPlans: MealPlan[];
  fastingSchedules: FastingSchedule[];
  dietaryRestrictions: DietaryRestrictions | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions - Meals
  fetchMeals: (date?: Date) => Promise<void>;
  addMeal: (meal: Omit<Meal, "id" | "createdAt">) => Promise<void>;
  updateMeal: (id: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  markMealConsumed: (
    id: string,
    rating?: number,
    notes?: string
  ) => Promise<void>;

  // Actions - Diet Logs
  fetchDietLogs: (startDate?: Date, endDate?: Date) => Promise<void>;
  addDietLog: (log: Omit<DietLog, "id" | "createdAt">) => Promise<void>;
  updateDietLog: (id: string, updates: Partial<DietLog>) => Promise<void>;
  getDietLogByDate: (date: Date) => Promise<DietLog | null>;

  // Actions - Water Tracking
  fetchWaterLogs: (startDate?: Date, endDate?: Date) => Promise<void>;
  addWaterIntake: (amount: number, date?: Date) => Promise<void>;
  getWaterLogByDate: (date: Date) => Promise<WaterLog | null>;
  updateWaterLog: (id: string, updates: Partial<WaterLog>) => Promise<void>;

  // Actions - Meal Plans
  fetchMealPlans: () => Promise<void>;
  createMealPlan: (
    plan: Omit<MealPlan, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;

  // Actions - Fasting
  fetchFastingSchedules: () => Promise<void>;
  createFastingSchedule: (
    schedule: Omit<FastingSchedule, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateFastingSchedule: (
    id: string,
    updates: Partial<FastingSchedule>
  ) => Promise<void>;
  deleteFastingSchedule: (id: string) => Promise<void>;

  // Actions - Dietary Restrictions
  fetchDietaryRestrictions: () => Promise<void>;
  updateDietaryRestrictions: (
    restrictions: Partial<DietaryRestrictions>
  ) => Promise<void>;

  // Analytics
  calculateDailyCompliance: (date: Date) => Promise<number>;
  calculateWeeklyCompliance: (startDate: Date) => Promise<number>;

  // Utilities
  clearError: () => void;
  initializeStore: () => Promise<void>;
}

export const useDietStore = create<DietState>((set, get) => ({
  // Initial state
  meals: [],
  dietLogs: [],
  waterLogs: [],
  mealPlans: [],
  fastingSchedules: [],
  dietaryRestrictions: null,
  isLoading: false,
  isHydrated: false,
  error: null,

  // Initialize store - load recent data
  initializeStore: async () => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    set({ isLoading: true });

    try {
      // Load today's meals
      await get().fetchMeals(new Date());

      // Load last 7 days of diet logs
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      await get().fetchDietLogs(startDate, endDate);

      // Load last 7 days of water logs
      await get().fetchWaterLogs(startDate, endDate);

      // Load dietary restrictions
      await get().fetchDietaryRestrictions();

      set({ isLoading: false, isHydrated: true });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize diet store",
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  // Fetch meals for a specific date
  fetchMeals: async (date = new Date()) => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const store = await dbManager.getStore<Meal | WaterLog>(STORES.DIET_ENTRIES);
      if (!store) {
        set({
          meals: [],
          isLoading: false,
          error: "Database not available"
        });
        return;
      }

      // Get all entries for the user
      const allEntries = await store.getAllByIndex("userId", "user-1");

      // Filter and validate only Meal entries using type guard
      const allMeals = filterMeals(allEntries);

      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const meals = allMeals.filter((meal) => {
        const mealDate = new Date(meal.date);
        mealDate.setHours(0, 0, 0, 0);
        return mealDate.getTime() === targetDate.getTime();
      });

      // Sort by scheduled time
      meals.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

      set({ meals, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch meals",
        isLoading: false,
      });
    }
  },

  // Add new meal
  addMeal: async (meal) => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const newMeal: Meal = {
        ...meal,
        id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        entryType: "meal", // Add discriminator
        createdAt: new Date(),
      };

      const store = await dbManager.getStore<Meal>(STORES.DIET_ENTRIES);
      if (!store) {
        set({ isLoading: false });
        return;
      }

      await store.add(newMeal);

      set((state) => ({
        meals: [...state.meals, newMeal],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add meal",
        isLoading: false,
      });
    }
  },

  // Update meal
  updateMeal: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      const store = await dbManager.getStore<Meal>(STORES.DIET_ENTRIES);
      if (!store) {
        set({ isLoading: false });
        return;
      }

      const existing = await store.get(id);

      if (!existing) {
        throw new Error("Meal not found");
      }

      const updated: Meal = { ...existing, ...updates };
      await store.put(updated);

      set((state) => ({
        meals: state.meals.map((m) => (m.id === id ? updated : m)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update meal",
        isLoading: false,
      });
    }
  },

  // Delete meal
  deleteMeal: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const store = await dbManager.getStore<Meal>(STORES.DIET_ENTRIES);
      if (!store) {
        set({ isLoading: false });
        return;
      }

      await store.delete(id);

      set((state) => ({
        meals: state.meals.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete meal",
        isLoading: false,
      });
    }
  },

  // Mark meal as consumed
  markMealConsumed: async (id, rating, notes) => {
    await get().updateMeal(id, {
      consumed: true,
      consumedAt: new Date(),
      rating,
      notes,
    });
  },

  // Fetch diet logs
  fetchDietLogs: async (startDate, endDate) => {
    set({ isLoading: true, error: null });

    try {
      const store = await dbManager.getStore<DietLog>(STORES.DIET_ENTRIES);
      if (!store) {
        set({ dietLogs: [], isLoading: false });
        return;
      }

      let logs: DietLog[];

      if (startDate && endDate) {
        const range = IDBKeyRange.bound(
          ["user-1", startDate],
          ["user-1", endDate]
        );
        logs = await store.getAllByIndex("userId_date", range);
      } else {
        logs = await store.getAllByIndex("userId", "user-1");
      }

      // Sort by date descending
      logs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      set({ dietLogs: logs, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch diet logs",
        isLoading: false,
      });
    }
  },

  // Add diet log
  addDietLog: async (log) => {
    set({ isLoading: true, error: null });

    try {
      const newLog: DietLog = {
        ...log,
        id: `diet-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      const store = await dbManager.getStore<DietLog>(STORES.DIET_ENTRIES);
      if (!store) {
        set({ isLoading: false });
        return;
      }

      await store.add(newLog);

      set((state) => ({
        dietLogs: [newLog, ...state.dietLogs],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add diet log",
        isLoading: false,
      });
    }
  },

  // Update diet log
  updateDietLog: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      const store = await dbManager.getStore<DietLog>(STORES.DIET_ENTRIES);
      if (!store) {
        set({ isLoading: false });
        return;
      }

      const existing = await store.get(id);

      if (!existing) {
        throw new Error("Diet log not found");
      }

      const updated: DietLog = { ...existing, ...updates };
      await store.put(updated);

      set((state) => ({
        dietLogs: state.dietLogs.map((l) => (l.id === id ? updated : l)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update diet log",
        isLoading: false,
      });
    }
  },

  // Get diet log by date
  getDietLogByDate: async (date) => {
    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const store = await dbManager.getStore<DietLog>(STORES.DIET_ENTRIES);
      if (!store) return null;

      const logs = await store.getAllByIndex("userId", "user-1");

      const log = logs.find((l) => {
        const logDate = new Date(l.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === targetDate.getTime();
      });

      return log || null;
    } catch (error) {
      console.error("Failed to get diet log by date:", error);
      return null;
    }
  },

  // Fetch water logs
  fetchWaterLogs: async (startDate, endDate) => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const store = await dbManager.getStore<Meal | WaterLog>(STORES.DIET_ENTRIES);
      if (!store) {
        set({
          waterLogs: [],
          isLoading: false,
          error: "Database not available"
        });
        return;
      }

      let allEntries: unknown[];

      if (startDate && endDate) {
        const range = IDBKeyRange.bound(
          ["user-1", startDate],
          ["user-1", endDate]
        );
        allEntries = await store.getAllByIndex("userId_date", range);
      } else {
        allEntries = await store.getAllByIndex("userId", "user-1");
      }

      // Filter and validate only WaterLog entries using type guard
      const logs = filterWaterLogs(allEntries);

      // Sort by date descending
      logs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      set({ waterLogs: logs, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch water logs",
        isLoading: false,
      });
    }
  },

  // Add water intake
  addWaterIntake: async (amount, date = new Date()) => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Check if log exists for this date
      const existingLog = await get().getWaterLogByDate(targetDate);

      if (existingLog) {
        // Update existing log
        const updated: WaterLog = {
          ...existingLog,
          milliliters: existingLog.milliliters + amount,
          glasses: Math.round((existingLog.milliliters + amount) / 250), // 1 glass = 250ml
          entries: [...existingLog.entries, { time: new Date(), amount }],
          achieved: existingLog.milliliters + amount >= existingLog.dailyGoal,
        };

        // Save to database
        const store = await dbManager.getStore<WaterLog>(STORES.DIET_ENTRIES);
        if (!store) {
          set({ isLoading: false });
          return;
        }

        await store.put(updated);

        // Update state
        set((state) => ({
          waterLogs: state.waterLogs.map((l) =>
            l.id === existingLog.id ? updated : l
          ),
          isLoading: false,
        }));
      } else {
        // Create new log
        const dailyGoal = 2500; // 2.5 liters
        const newLog: WaterLog = {
          id: `water-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          entryType: "water", // Add discriminator
          userId: "user-1",
          date: targetDate,
          glasses: Math.round(amount / 250),
          milliliters: amount,
          entries: [{ time: new Date(), amount }],
          dailyGoal,
          achieved: amount >= dailyGoal,
          createdAt: new Date(),
        };

        const store = await dbManager.getStore<WaterLog>(STORES.DIET_ENTRIES);
        if (!store) {
          set({ isLoading: false });
          return;
        }

        await store.add(newLog);

        set((state) => ({
          waterLogs: [newLog, ...state.waterLogs],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add water intake",
        isLoading: false,
      });
    }
  },

  // Get water log by date
  getWaterLogByDate: async (date) => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const store = await dbManager.getStore<any>(STORES.DIET_ENTRIES);
      if (!store) return null;

      const allEntries = await store.getAllByIndex("userId", "user-1");

      // Filter only WaterLog entries using discriminator
      const logs = allEntries.filter(
        (entry: any) => entry.entryType === "water"
      ) as WaterLog[];

      const log = logs.find((l) => {
        const logDate = new Date(l.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === targetDate.getTime();
      });

      return log || null;
    } catch (error) {
      console.error("Failed to get water log by date:", error);
      return null;
    }
  },

  // Update water log
  updateWaterLog: async (id, updates) => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const store = await dbManager.getStore<WaterLog>(STORES.DIET_ENTRIES);
      if (!store) {
        set({ isLoading: false });
        return;
      }

      const existing = await store.get(id);

      if (!existing) {
        throw new Error("Water log not found");
      }

      const updated: WaterLog = { ...existing, ...updates };
      await store.put(updated);

      set((state) => ({
        waterLogs: state.waterLogs.map((l) => (l.id === id ? updated : l)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update water log",
        isLoading: false,
      });
    }
  },

  // Fetch meal plans
  fetchMealPlans: async () => {
    set({ isLoading: true, error: null });

    try {
      // Meal plans stored in memory for now (can add to IndexedDB later)
      set({ mealPlans: [], isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch meal plans",
        isLoading: false,
      });
    }
  },

  // Create meal plan
  createMealPlan: async (plan) => {
    set({ isLoading: true, error: null });

    try {
      const newPlan: MealPlan = {
        ...plan,
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        mealPlans: [newPlan, ...state.mealPlans],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create meal plan",
        isLoading: false,
      });
    }
  },

  // Update meal plan
  updateMealPlan: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      set((state) => ({
        mealPlans: state.mealPlans.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update meal plan",
        isLoading: false,
      });
    }
  },

  // Delete meal plan
  deleteMealPlan: async (id) => {
    set({ isLoading: true, error: null });

    try {
      set((state) => ({
        mealPlans: state.mealPlans.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete meal plan",
        isLoading: false,
      });
    }
  },

  // Fetch fasting schedules
  fetchFastingSchedules: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fasting schedules stored in memory for now
      set({ fastingSchedules: [], isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch fasting schedules",
        isLoading: false,
      });
    }
  },

  // Create fasting schedule
  createFastingSchedule: async (schedule) => {
    set({ isLoading: true, error: null });

    try {
      const newSchedule: FastingSchedule = {
        ...schedule,
        id: `fast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        fastingSchedules: [newSchedule, ...state.fastingSchedules],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create fasting schedule",
        isLoading: false,
      });
    }
  },

  // Update fasting schedule
  updateFastingSchedule: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      set((state) => ({
        fastingSchedules: state.fastingSchedules.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update fasting schedule",
        isLoading: false,
      });
    }
  },

  // Delete fasting schedule
  deleteFastingSchedule: async (id) => {
    set({ isLoading: true, error: null });

    try {
      set((state) => ({
        fastingSchedules: state.fastingSchedules.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete fasting schedule",
        isLoading: false,
      });
    }
  },

  // Fetch dietary restrictions
  fetchDietaryRestrictions: async () => {
    set({ isLoading: true, error: null });

    try {
      // Dietary restrictions stored in memory for now
      // In production, could be stored in user profile or settings
      set({ dietaryRestrictions: null, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dietary restrictions",
        isLoading: false,
      });
    }
  },

  // Update dietary restrictions
  updateDietaryRestrictions: async (restrictions) => {
    set({ isLoading: true, error: null });

    try {
      set((state) => ({
        dietaryRestrictions: state.dietaryRestrictions
          ? {
              ...state.dietaryRestrictions,
              ...restrictions,
              updatedAt: new Date(),
            }
          : ({
              userId: "user-1",
              ...restrictions,
              updatedAt: new Date(),
            } as DietaryRestrictions),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update dietary restrictions",
        isLoading: false,
      });
    }
  },

  // Calculate daily compliance
  calculateDailyCompliance: async (date) => {
    try {
      const log = await get().getDietLogByDate(date);
      return log ? log.summary.compliance : 0;
    } catch (error) {
      console.error("Failed to calculate daily compliance:", error);
      return 0;
    }
  },

  // Calculate weekly compliance
  calculateWeeklyCompliance: async (startDate) => {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const store = await dbManager.getStore<DietLog>(STORES.DIET_ENTRIES);
      if (!store) return 0;

      const range = IDBKeyRange.bound(
        ["user-1", startDate],
        ["user-1", endDate]
      );
      const logs = await store.getAllByIndex("userId_date", range);

      if (logs.length === 0) return 0;

      const totalCompliance = logs.reduce(
        (sum, log) => sum + log.summary.compliance,
        0
      );
      return Math.round(totalCompliance / logs.length);
    } catch (error) {
      console.error("Failed to calculate weekly compliance:", error);
      return 0;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
