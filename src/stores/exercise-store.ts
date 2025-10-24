import { create } from "zustand";
import type {
  Exercise,
  ExerciseRoutine,
  ExerciseSession,
  ExerciseCompletion,
} from "@/types/exercise";

interface ExerciseState {
  // State
  exercises: Exercise[];
  routines: ExerciseRoutine[];
  sessions: ExerciseSession[];
  activeSession: ExerciseSession | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  fetchExercises: (category?: string, difficulty?: string) => Promise<void>;
  fetchRoutines: () => Promise<void>;
  createRoutine: (
    routine: Omit<ExerciseRoutine, "id" | "createdAt">
  ) => Promise<void>;
  startSession: (routineId: string) => Promise<void>;
  completeExercise: (
    exerciseId: string,
    completion: Partial<ExerciseCompletion>
  ) => void;
  endSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  clearError: () => void;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  exercises: [],
  routines: [],
  sessions: [],
  activeSession: null,
  isLoading: false,
  isHydrated: false,
  error: null,

  // Fetch exercises
  fetchExercises: async (category, difficulty) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (difficulty) params.append("difficulty", difficulty);

      // TODO: Call actual API endpoint
      const response = await fetch(`/api/exercises?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }

      const exercises = await response.json();

      set({
        exercises,
        isLoading: false,
        isHydrated: true,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch exercises",
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  // Fetch routines
  fetchRoutines: async () => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Call actual API endpoint
      const response = await fetch("/api/exercises/routines");

      if (!response.ok) {
        throw new Error("Failed to fetch routines");
      }

      const routines = await response.json();

      set({
        routines,
        isLoading: false,
        isHydrated: true,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch routines",
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  // Create routine
  createRoutine: async (routine) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Call actual API endpoint
      const response = await fetch("/api/exercises/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routine),
      });

      if (!response.ok) {
        throw new Error("Failed to create routine");
      }

      const newRoutine = await response.json();

      set((state) => ({
        routines: [...state.routines, newRoutine],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create routine",
        isLoading: false,
      });
    }
  },

  // Start exercise session
  startSession: async (routineId) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Call actual API endpoint
      const response = await fetch("/api/exercises/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routineId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const session = await response.json();

      set({
        activeSession: session,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to start session",
        isLoading: false,
      });
    }
  },

  // Complete an exercise in the active session
  completeExercise: (exerciseId, completion) => {
    const activeSession = get().activeSession;
    if (!activeSession) return;

    // Check if exercise already completed
    const existingIndex = activeSession.completed.findIndex(
      (c) => c.exerciseId === exerciseId
    );

    let updatedCompleted: ExerciseCompletion[];

    if (existingIndex >= 0) {
      // Update existing completion
      updatedCompleted = activeSession.completed.map((c, idx) =>
        idx === existingIndex ? { ...c, completed: true, ...completion } : c
      );
    } else {
      // Add new completion
      updatedCompleted = [
        ...activeSession.completed,
        {
          exerciseId,
          completed: true,
          ...completion,
        },
      ];
    }

    set({
      activeSession: {
        ...activeSession,
        completed: updatedCompleted,
      },
    });
  },

  // End exercise session
  endSession: async () => {
    const activeSession = get().activeSession;
    if (!activeSession) return;

    set({ isLoading: true, error: null });

    try {
      // TODO: Call actual API endpoint
      const response = await fetch(
        `/api/exercises/sessions/${activeSession.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            endTime: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to end session");
      }

      const completedSession = await response.json();

      set((state) => ({
        sessions: [completedSession, ...state.sessions],
        activeSession: null,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to end session",
        isLoading: false,
      });
    }
  },

  // Pause session (mark as partial)
  pauseSession: () => {
    const activeSession = get().activeSession;
    if (activeSession) {
      set({
        activeSession: {
          ...activeSession,
          status: "partial",
        },
      });
    }
  },

  // Resume session (keep as partial until completed)
  resumeSession: () => {
    const activeSession = get().activeSession;
    if (activeSession && activeSession.status === "partial") {
      // Keep as partial - will be set to completed when session ends
      set({
        activeSession: {
          ...activeSession,
        },
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
