import { create } from "zustand";
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
  initializeSessions: () => Promise<void>;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  exercises: [],
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,

  // Initialize sessions from IndexedDB
  initializeSessions: async () => {
    set({ isLoading: true });

    try {
      const store = await dbManager.getStore<ExerciseSession>(
        STORES.EXERCISE_SESSIONS
      );
      if (!store) {
        set({ sessions: [], isLoading: false });
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
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load exercise sessions",
        isLoading: false,
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
          description: "Gentle exercise to restore cervical lordosis and strengthen deep neck flexors",
          category: "posture",
          difficulty: "beginner",
          duration: 180,
          repetitions: 10,
          sets: 3,
          instructions: [
            "Sit or stand tall with shoulders relaxed and eyes looking forward.",
            "Gently draw your chin straight back as if making a double chin.",
            "Hold for 5 seconds while keeping the back of the neck long, then release.",
          ],
          videoUrl: "",
          imageUrl: "",
          contraindications: ["acute neck pain", "severe disc herniation"],
          warnings: ["Stop if you feel sharp pain", "Keep movements slow and controlled"],
          modifications: ["Perform lying on your back for extra support"],
          targetAreas: ["cervical spine", "neck"],
          benefits: [
            "Improves neck posture",
            "Reduces forward head position",
            "Strengthens deep neck muscles",
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "ex-2",
          name: "Wall Angels",
          description: "Shoulder blade retraction exercise to improve upper back posture",
          category: "mobility",
          difficulty: "beginner",
          duration: 240,
          repetitions: 12,
          sets: 3,
          instructions: [
            "Stand with your back against a wall, feet 6 inches forward, and arms in a goal-post shape.",
            "Gently press your lower back, shoulders, and head into the wall.",
            "Slowly slide your arms overhead while keeping contact with the wall, then return to start.",
          ],
          videoUrl: "",
          imageUrl: "",
          contraindications: ["shoulder impingement", "rotator cuff injury"],
          warnings: ["Keep lower back against wall", "Move slowly through full range"],
          modifications: ["Perform seated if balance is limited"],
          targetAreas: ["upper back", "shoulders"],
          benefits: [
            "Opens chest",
            "Strengthens upper back",
            "Improves shoulder mobility",
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "ex-3",
          name: "Cat-Cow Stretch",
          description: "Gentle spinal mobility exercise for the entire spine",
          category: "mobility",
          difficulty: "beginner",
          duration: 120,
          repetitions: 10,
          sets: 2,
          instructions: [
            "Begin on hands and knees with shoulders over wrists and hips over knees.",
            "Inhale, drop the belly, lift the chest, and gently arch the back (cow).",
            "Exhale, round the spine toward the ceiling and tuck the chin (cat).",
          ],
          videoUrl: "",
          imageUrl: "",
          contraindications: ["acute back spasms"],
          warnings: ["Move within a comfortable range", "Avoid if experiencing severe pain"],
          modifications: ["Perform seated by rounding and arching the back while holding knees"],
          targetAreas: ["entire spine", "lower back"],
          benefits: ["Increases spinal flexibility", "Relieves back tension", "Improves posture"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "ex-4",
          name: "Doorway Chest Stretch",
          description: "Stretch to open chest muscles and counteract rounded shoulders",
          category: "stretching",
          difficulty: "beginner",
          duration: 180,
          instructions: [
            "Stand in a doorway with elbows bent at 90 degrees and forearms on the frame.",
            "Step one foot forward and gently lean until a stretch is felt across the chest.",
            "Hold the stretch for 30 seconds while breathing steadily, then relax.",
          ],
          videoUrl: "",
          imageUrl: "",
          contraindications: ["shoulder dislocation history"],
          warnings: ["Do not overstretch", "Stop if shoulder discomfort increases"],
          modifications: ["Lower the arms on the frame if shoulder range is limited"],
          targetAreas: ["chest", "shoulders"],
          benefits: ["Opens chest", "Improves posture", "Reduces shoulder tension"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "ex-5",
          name: "Prone Cobra",
          description: "Strengthening exercise for the upper and mid-back muscles",
          category: "strengthening",
          difficulty: "intermediate",
          duration: 90,
          repetitions: 8,
          sets: 3,
          instructions: [
            "Lie face down with arms at your sides and palms facing the floor.",
            "Engage your core, squeeze shoulder blades together, and lift chest, arms, and head slightly off the floor.",
            "Hold for 5 seconds while keeping neck neutral, then lower slowly.",
          ],
          videoUrl: "",
          imageUrl: "",
          contraindications: ["acute back pain", "disc herniation"],
          warnings: ["Start with short holds", "Keep neck neutral"],
          modifications: ["Perform with a rolled towel under the chest for support"],
          targetAreas: ["upper back", "mid back"],
          benefits: [
            "Strengthens back extensors",
            "Improves posture",
            "Increases back endurance",
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      set({
        exercises: mockExercises,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch exercises",
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
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            completed: [...state.activeSession.completed, exerciseCompletion],
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
        error: error instanceof Error ? error.message : "Failed to end session",
        isLoading: false,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
