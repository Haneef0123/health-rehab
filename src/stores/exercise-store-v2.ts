import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Exercise,
  ExerciseSession,
  ExerciseCompletion,
} from "@/types/exercise";
import { dbManager, STORES } from "@/lib/db";

interface ExerciseState {
  // State
  exercises: Exercise[];
  sessions: ExerciseSession[];
  activeSession: ExerciseSession | null;
  isLoading: boolean;
  error: string | null;
  _isHydrated: boolean;

  // Actions
  fetchExercises: (category?: string, difficulty?: string) => Promise<void>;
  fetchSessions: (startDate?: Date, endDate?: Date) => Promise<void>;
  startSession: (exerciseId: string) => void;
  completeExercise: (
    exerciseId: string,
    completion: Partial<ExerciseCompletion>
  ) => void;
  endSession: () => Promise<void>;
  clearError: () => void;
  initializeStore: () => Promise<void>;
  _setHydrated: (hydrated: boolean) => void;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      // Initial state
      exercises: [],
      sessions: [],
      activeSession: null,
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
          const store = await dbManager.getStore<ExerciseSession>(
            STORES.EXERCISE_SESSIONS
          );
          if (!store) {
            set({ sessions: [], isLoading: false, _isHydrated: true });
            return;
          }

          const sessions = await store.getAllByIndex("userId", "user-1");

          // Sort by date descending
          const sortedSessions = sessions.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          set({
            sessions: sortedSessions,
            isLoading: false,
            _isHydrated: true,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load exercise sessions",
            isLoading: false,
            _isHydrated: true,
          });
        }
      },

      // Fetch exercises (mock data for now)
      fetchExercises: async (category, difficulty) => {
        set({ isLoading: true, error: null });

        try {
          // Mock exercises - in production, fetch from API
          const mockExercises: Exercise[] = [
            {
              id: "ex-1",
              name: "Chin Tucks",
              description: "Gentle neck strengthening exercise",
              category: "stretching",
              difficulty: "beginner",
              duration: 5,
              repetitions: 10,
              sets: 3,
              instructions: [
                "Sit or stand with good posture",
                "Gently tuck your chin",
                "Hold for 5 seconds",
              ],
              videoUrl: "",
              imageUrl: "",
              contraindications: [],
              warnings: [],
              modifications: [],
              targetAreas: ["cervical spine", "neck"],
              benefits: [
                "Improves neck posture",
                "Strengthens deep neck flexors",
              ],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            // Add more mock exercises as needed
          ];

          set({
            exercises: mockExercises,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch exercises",
            isLoading: false,
          });
        }
      },

      // Fetch sessions with optional date range
      fetchSessions: async (startDate?: Date, endDate?: Date) => {
        set({ isLoading: true, error: null });

        try {
          const store = await dbManager.getStore<ExerciseSession>(
            STORES.EXERCISE_SESSIONS
          );
          if (!store) {
            set({ sessions: [], isLoading: false });
            return;
          }

          let sessions: ExerciseSession[];

          if (startDate && endDate) {
            const range = IDBKeyRange.bound(
              ["user-1", startDate],
              ["user-1", endDate]
            );
            sessions = await store.getAllByIndex("userId_date", range);
          } else {
            sessions = await store.getAllByIndex("userId", "user-1");
          }

          const sortedSessions = sessions.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          set({
            sessions: sortedSessions,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch exercise sessions",
            isLoading: false,
          });
        }
      },

      // Start session
      startSession: (exerciseId: string) => {
        const newSession: ExerciseSession = {
          id: `session-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          userId: "user-1",
          // routineId is optional - for single exercise sessions, we can leave it undefined
          date: new Date(),
          completed: [],
          totalDuration: 0,
          status: "partial",
          difficultyRating: 3,
          painDuring: 0,
          painAfter: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({ activeSession: newSession });
      },

      // Complete exercise
      completeExercise: (exerciseId, completion) => {
        const session = get().activeSession;
        if (!session) return;

        const exerciseCompletion: ExerciseCompletion = {
          exerciseId,
          completed: completion.completed ?? true,
          repetitions: completion.repetitions,
          sets: completion.sets,
          duration: completion.duration,
          notes: completion.notes,
          painLevel: completion.painLevel,
        };

        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                completed: [
                  ...state.activeSession.completed,
                  exerciseCompletion,
                ],
                updatedAt: new Date(),
              }
            : null,
        }));
      },

      // End session
      endSession: async () => {
        const session = get().activeSession;
        if (!session) return;

        set({ isLoading: true, error: null });

        try {
          const completedSession: ExerciseSession = {
            ...session,
            status: "completed",
            updatedAt: new Date(),
          };

          // Save to IndexedDB
          const store = await dbManager.getStore<ExerciseSession>(
            STORES.EXERCISE_SESSIONS
          );
          if (!store) {
            set({ isLoading: false });
            return;
          }

          await store.add(completedSession);

          set((state) => ({
            sessions: [completedSession, ...state.sessions],
            activeSession: null,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to end session",
            isLoading: false,
          });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "exercise-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        exercises: state.exercises,
        sessions: state.sessions,
        activeSession: state.activeSession,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("[Exercise Store] Hydration error:", error);
          } else if (state) {
            console.log("[Exercise Store] Hydrated successfully");
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
