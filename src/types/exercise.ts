// Exercise types
export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  difficulty: "beginner" | "intermediate" | "advanced";

  // Instructions
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  duration: number; // seconds
  repetitions?: number;
  sets?: number;

  // Safety
  contraindications: string[];
  warnings: string[];
  modifications: string[]; // easier variations

  // Targeting
  targetAreas: string[]; // e.g., "cervical spine", "upper back"
  benefits: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type ExerciseCategory =
  | "stretching"
  | "strengthening"
  | "mobility"
  | "posture"
  | "breathing"
  | "relaxation";

// Exercise routine
export interface ExerciseRoutine {
  id: string;
  name: string;
  description: string;
  exercises: RoutineExercise[];

  // Scheduling
  frequency: number; // times per week
  duration: number; // total minutes
  difficulty: "beginner" | "intermediate" | "advanced";

  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineExercise {
  exerciseId: string;
  order: number;
  duration?: number;
  repetitions?: number;
  sets?: number;
  restBetweenSets?: number; // seconds
  notes?: string;
}

// Exercise session (actual workout)
export interface ExerciseSession {
  id: string;
  userId: string;
  routineId?: string;
  date: Date;

  // Completion
  completed: ExerciseCompletion[];
  totalDuration: number; // minutes
  status: "completed" | "partial" | "skipped";

  // Feedback
  difficultyRating: number; // 1-5
  painDuring: number; // 0-10
  painAfter: number; // 0-10
  notes?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseCompletion {
  exerciseId: string;
  completed: boolean;
  repetitions?: number;
  sets?: number;
  duration?: number;
  notes?: string;
  painLevel?: number; // 0-10
}

// Exercise recommendations
export interface ExerciseRecommendation {
  exerciseId: string;
  reason: string;
  priority: "high" | "medium" | "low";
  adaptations?: string[]; // specific modifications for user's condition
}
