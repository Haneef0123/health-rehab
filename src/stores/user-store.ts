import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  updateMedicalProfile: (updates: Partial<User["medicalProfile"]>) => void;
  updatePreferences: (updates: Partial<User["preferences"]>) => void;
  clearError: () => void;
  initializeUser: () => Promise<void>;
}

// Default user data - you can customize this with your actual information
const DEFAULT_USER: User = {
  id: "user-1",
  name: "Haneef Shaikh",
  email: "haneef@example.com",
  dateOfBirth: new Date("1990-01-01"), // Update with your actual DOB
  medicalProfile: {
    conditions: ["cervical lordosis", "disc bulges C4-C5, C5-C6"],
    sittingTolerance: 15, // minutes
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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isHydrated: false,
      error: null,

      // Set user (initial load)
      setUser: (user: User) => {
        set({ user, error: null, isHydrated: true });
      },

      // Update user
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updates,
              updatedAt: new Date(),
            },
          });
        }
      },

      // Update medical profile
      updateMedicalProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              medicalProfile: {
                ...currentUser.medicalProfile,
                ...updates,
                updatedAt: new Date(),
              },
              updatedAt: new Date(),
            },
          });
        }
      },

      // Update preferences
      updatePreferences: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              preferences: {
                ...currentUser.preferences,
                ...updates,
              },
              updatedAt: new Date(),
            },
          });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Initialize user (load or create default)
      initializeUser: async () => {
        set({ isLoading: true });

        try {
          const currentUser = get().user;

          // If no user exists, use default
          if (!currentUser) {
            set({ user: DEFAULT_USER, isLoading: false, isHydrated: true });
          } else {
            set({ isLoading: false, isHydrated: true });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize user",
            isLoading: false,
            isHydrated: true,
          });
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
