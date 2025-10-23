// Pain tracking types
export interface PainLog {
  id: string;
  userId: string;
  timestamp: Date;

  // Pain details
  level: number; // 0-10 scale
  location: PainLocation[];
  type: PainType[];
  triggers?: string[];

  // Context
  activity?: string; // What were you doing?
  position?: string; // sitting, standing, lying, etc.
  duration?: number; // How long in minutes

  // Associated data
  beforeExercise?: boolean;
  afterExercise?: boolean;
  exerciseSessionId?: string;

  medication?: {
    taken: boolean;
    name?: string;
    dosage?: string;
    time?: Date;
  };

  // Qualitative data
  notes?: string;
  mood?: "good" | "okay" | "bad";

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type PainLocation =
  | "neck"
  | "upper-back"
  | "mid-back"
  | "lower-back"
  | "shoulders"
  | "arms"
  | "head"
  | "legs";

export type PainType =
  | "sharp"
  | "dull"
  | "aching"
  | "burning"
  | "stabbing"
  | "tingling"
  | "numbness"
  | "stiffness";

// Pain analytics
export interface PainAnalytics {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };

  // Summary stats
  average: number;
  highest: number;
  lowest: number;
  trend: "improving" | "stable" | "worsening";

  // Patterns
  commonLocations: { location: PainLocation; count: number }[];
  commonTypes: { type: PainType; count: number }[];
  commonTriggers: { trigger: string; count: number }[];

  // Time patterns
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };

  // Activity correlation
  activityCorrelation: {
    activity: string;
    averagePain: number;
    occurrences: number;
  }[];
}

// Pain scale definition
export const PAIN_SCALE = {
  0: { label: "No Pain", color: "#22c55e", description: "Feeling great!" },
  1: { label: "Minimal", color: "#84cc16", description: "Barely noticeable" },
  2: { label: "Mild", color: "#eab308", description: "Minor discomfort" },
  3: {
    label: "Moderate Low",
    color: "#f59e0b",
    description: "Noticeable but manageable",
  },
  4: { label: "Moderate", color: "#f97316", description: "Uncomfortable" },
  5: { label: "Moderate High", color: "#fb923c", description: "Distracting" },
  6: {
    label: "Severe Low",
    color: "#f87171",
    description: "Significantly limiting",
  },
  7: { label: "Severe", color: "#ef4444", description: "Very distressing" },
  8: {
    label: "Very Severe",
    color: "#dc2626",
    description: "Intense, hard to function",
  },
  9: { label: "Extreme", color: "#b91c1c", description: "Nearly unbearable" },
  10: {
    label: "Worst Possible",
    color: "#991b1b",
    description: "Emergency level",
  },
} as const;
