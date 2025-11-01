import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";
import {
  dbManager,
  STORES,
  needsMigration,
  migrateFromLocalStorage,
} from "@/lib/db";

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  updateMedicalProfile: (updates: Partial<User["medicalProfile"]>) => void;
  updatePreferences: (updates: Partial<User["preferences"]>) => void;
  clearError: () => void;
  initializeUser: () => Promise<void>;
  syncToDB: () => Promise<void>;
}

// Default user data
const DEFAULT_USER: User = {
  id: "user-1",
  name: "Haneef Shaikh",
  email: "haneef@example.com",
  dateOfBirth: new Date("1990-01-01"),
  medicalProfile: {
    conditions: ["cervical lordosis", "disc bulges C4-C5, C5-C6"],
    sittingTolerance: 15,
    chronicPainAreas: ["neck", "upper back"],
    painLevel: 5,
    painTriggers: ["prolonged sitting", "poor posture", "stress"],
    contraindications: [],
    allergies: [],
    medications: [],
    updatedAt: new Date(),
  },
  preferences: {
    theme: "system",
    notifications: {
      exerciseReminders: true,
      painLogReminders: true,
      medicationReminders: true,
      progressReports: true,
      reminderTime: "09:00",
    },
    exercisePreferences: {
      difficulty: "beginner",
      sessionDuration: 20,
      preferredTime: "morning",
      categories: ["stretching", "mobility", "posture"],
    },
    dietPreferences: {
      naturopathicDiet: true,
      oilFree: true,
      saltFree: true,
      sugarFree: true,
      mealReminders: true,
      waterIntakeGoal: 10,
    },
    units: {
      distance: "km",
      weight: "kg",
      temperature: "celsius",
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// IndexedDB storage adapter
const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const store = await dbManager.getStore<User>(STORES.USERS);
      if (!store) return null;

      const user = await store.get("user-1");
      if (user) {
        return JSON.stringify({ state: { user } });
      }
      return null;
    } catch (error) {
      console.error("Error reading from IndexedDB:", error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    try {
      const parsed = JSON.parse(value);
      if (parsed.state?.user) {
        const store = await dbManager.getStore<User>(STORES.USERS);
        if (!store) return;

        await store.put(parsed.state.user);
      }
    } catch (error) {
      console.error("Error writing to IndexedDB:", error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    try {
      const store = await dbManager.getStore<User>(STORES.USERS);
      if (!store) return;

      await store.delete("user-1");
    } catch (error) {
      console.error("Error removing from IndexedDB:", error);
    }
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,

      // Set user
      setUser: (user: User) => {
        set({ user, error: null });
        get().syncToDB();
      },

      // Update user
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...updates,
            updatedAt: new Date(),
          };
          set({ user: updatedUser });
          get().syncToDB();
        }
      },

      // Update medical profile
      updateMedicalProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            medicalProfile: {
              ...currentUser.medicalProfile,
              ...updates,
              updatedAt: new Date(),
            },
            updatedAt: new Date(),
          };
          set({ user: updatedUser });
          get().syncToDB();
        }
      },

      // Update preferences
      updatePreferences: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            preferences: {
              ...currentUser.preferences,
              ...updates,
            },
            updatedAt: new Date(),
          };
          set({ user: updatedUser });
          get().syncToDB();
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Sync to IndexedDB
      syncToDB: async () => {
        // Skip during SSR
        if (typeof window === "undefined") {
          return;
        }

        try {
          const user = get().user;
          if (user) {
            const store = await dbManager.getStore<User>(STORES.USERS);
            if (!store) {
              set({ error: "Database not available" });
              return;
            }

            await store.put(user);
            // Clear any previous sync errors on success
            if (get().error?.includes("sync")) {
              set({ error: null });
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : "Failed to sync to IndexedDB";
          console.error("Failed to sync to IndexedDB:", error);
          set({ error: `Sync error: ${errorMessage}` });
        }
      },

      // Initialize user
      initializeUser: async () => {
        // Skip during SSR
        if (typeof window === "undefined") {
          set({ user: DEFAULT_USER, isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          // Check if migration is needed
          const shouldMigrate = await needsMigration();
          if (shouldMigrate) {
            console.log("📦 Migrating data from localStorage...");
            await migrateFromLocalStorage();
          }

          // Load from IndexedDB
          const store = await dbManager.getStore<User>(STORES.USERS);
          if (!store) {
            set({ user: DEFAULT_USER, isLoading: false });
            return;
          }

          const user = await store.get("user-1");

          if (user) {
            set({ user, isLoading: false });
          } else {
            // No user found, create default
            await store.put(DEFAULT_USER);
            set({ user: DEFAULT_USER, isLoading: false });
          }
        } catch (error) {
          console.error("Failed to initialize user:", error);
          // Fallback to default user
          set({
            user: DEFAULT_USER,
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize user",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => indexedDBStorage as any),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
