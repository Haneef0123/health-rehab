// Progress tracking types
export interface ProgressMetrics {
  userId: string;
  date: Date;

  // Pain metrics
  painMetrics: {
    average: number;
    highest: number;
    lowest: number;
    trend: "improving" | "stable" | "worsening";
  };

  // Exercise metrics
  exerciseMetrics: {
    sessionsCompleted: number;
    totalMinutes: number;
    consistency: number; // 0-100%
    averageDifficulty: number;
  };

  // Physical metrics
  physicalMetrics: {
    sittingTolerance: number; // minutes
    mobilityScore: number; // 0-100
    flexibilityScore: number; // 0-100
    strengthScore: number; // 0-100
  };

  // Lifestyle metrics
  lifestyleMetrics: {
    sleepQuality: number; // 1-10
    energyLevel: number; // 1-10
    stressLevel: number; // 1-10
    dietCompliance: number; // 0-100%
  };

  // Goals
  goals: Goal[];

  // Metadata
  createdAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "pain" | "exercise" | "mobility" | "lifestyle";

  // Target
  target: {
    type: "numeric" | "boolean" | "milestone";
    value: number | boolean | string;
    unit?: string;
  };

  // Progress
  current: number | boolean | string;
  progress: number; // 0-100%

  // Timing
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;

  // Status
  status: "active" | "completed" | "abandoned" | "paused";

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Progress milestones
export interface Milestone {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "pain" | "exercise" | "mobility" | "lifestyle";

  // Achievement
  achieved: boolean;
  achievedDate?: Date;

  // Celebration
  badge?: string;
  points?: number;
  message?: string;

  // Metadata
  createdAt: Date;
}

// Weekly/Monthly progress summary
export interface ProgressSummary {
  userId: string;
  period: {
    start: Date;
    end: Date;
    type: "week" | "month" | "quarter" | "year";
  };

  // Highlights
  highlights: string[];
  improvements: string[];
  challenges: string[];

  // Key metrics
  painReduction: number; // percentage
  exerciseConsistency: number; // percentage
  goalsAchieved: number;
  milestonesReached: number;

  // Recommendations
  recommendations: string[];

  // Metadata
  generatedAt: Date;
}
