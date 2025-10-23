// Medication tracking types
export interface Medication {
  id: string;
  userId: string;

  // Medication details
  name: string;
  type: "prescription" | "supplement" | "ayurvedic" | "homeopathic" | "other";
  dosage: string; // e.g., "500mg", "2 tablets", "10 drops"
  form:
    | "tablet"
    | "capsule"
    | "liquid"
    | "cream"
    | "powder"
    | "injection"
    | "other";

  // Purpose
  purpose: string;
  condition?: string;
  prescribedBy?: string;

  // Schedule
  schedule: {
    frequency: "once" | "twice" | "thrice" | "four_times" | "as_needed";
    times: string[]; // HH:MM format
    days?: (
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday"
    )[];
    withMeal?: boolean;
    onEmptyStomach?: boolean;
  };

  // Duration
  startDate: Date;
  endDate?: Date;
  indefinite: boolean;

  // Inventory
  inventory?: {
    current: number;
    unit: string;
    lowThreshold: number; // alert when below this
  };

  // Instructions
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
  contraindications?: string[];

  // Status
  active: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Medication intake log
export interface MedicationLog {
  id: string;
  userId: string;
  medicationId: string;

  // Intake details
  scheduledTime: Date;
  actualTime?: Date;

  // Status
  status: "taken" | "skipped" | "missed" | "pending";
  skipReason?: string;

  // Context
  withMeal?: boolean;
  notes?: string;

  // Side effects
  sideEffects?: {
    experienced: boolean;
    effects: string[];
    severity: "mild" | "moderate" | "severe";
  };

  // Metadata
  createdAt: Date;
}

// Medication reminder
export interface MedicationReminder {
  id: string;
  userId: string;
  medicationId: string;

  // Reminder details
  scheduledTime: Date;
  dismissed: boolean;
  dismissedAt?: Date;

  // Snooze
  snoozed: boolean;
  snoozeUntil?: Date;
  snoozeCount: number;

  // Action taken
  actionTaken?: "taken" | "skipped";
  actionTime?: Date;

  // Metadata
  createdAt: Date;
}

// Medication adherence tracking
export interface MedicationAdherence {
  userId: string;
  medicationId: string;

  // Period
  period: {
    start: Date;
    end: Date;
  };

  // Statistics
  stats: {
    scheduled: number;
    taken: number;
    skipped: number;
    missed: number;
    adherenceRate: number; // 0-100%
  };

  // Patterns
  patterns: {
    bestTime?: string; // time of day with best adherence
    worstTime?: string;
    commonSkipReasons?: string[];
  };

  // Metadata
  calculatedAt: Date;
}

// Supplement/vitamin tracking
export interface Supplement {
  id: string;
  userId: string;

  // Details
  name: string;
  category: "vitamin" | "mineral" | "herb" | "probiotic" | "other";
  dosage: string;

  // Purpose
  benefits: string[];
  recommendedBy?: string;

  // Schedule
  timesPerDay: number;
  preferredTime?: "morning" | "afternoon" | "evening" | "night";

  // Status
  active: boolean;

  // Metadata
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
