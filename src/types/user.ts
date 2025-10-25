// Core user types
// User types - Single user app (no authentication needed)
export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: Date;
  profileImage?: string;

  // Medical information
  medicalProfile: MedicalProfile;

  // Preferences
  preferences: UserPreferences;

  // Documents
  documents: UserDocument[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument {
  id: string;
  type:
    | "report"
    | "medication"
    | "imaging"
    | "prescription"
    | "insurance"
    | "other";
  title: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: Date;
  notes?: string;
  tags?: string[];
}

export interface MedicalProfile {
  // Primary conditions
  conditions: string[]; // e.g., ["cervical lordosis", "disc bulges C4-C5, C5-C6"]

  // Physical limitations
  sittingTolerance: number; // minutes (e.g., 15)
  standingTolerance?: number;
  walkingCapacity?: number; // meters

  // Pain information
  chronicPainAreas: string[];
  painLevel: number; // 0-10
  painTriggers: string[];

  // Medical restrictions
  contraindications: string[];
  allergies: string[];
  medications: string[];

  // Physical metrics
  height?: number; // cm
  weight?: number; // kg

  // Healthcare providers
  primaryDoctor?: string;
  physiotherapist?: string;
  otherProviders?: string[];

  // Emergency contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Last updated
  updatedAt: Date;
}

export interface UserPreferences {
  // UI preferences
  theme: "light" | "dark" | "system";

  // Notification preferences
  notifications: {
    exerciseReminders: boolean;
    painLogReminders: boolean;
    medicationReminders: boolean;
    progressReports: boolean;

    // Timing
    reminderTime?: string; // HH:MM format
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };

  // Exercise preferences
  exercisePreferences: {
    difficulty: "beginner" | "intermediate" | "advanced";
    sessionDuration: number; // minutes
    preferredTime: "morning" | "afternoon" | "evening";
    categories: string[]; // preferred exercise categories
  };

  // Diet preferences (Dr. Manthena Satyanarayana Raju principles)
  dietPreferences: {
    naturopathicDiet: boolean;
    oilFree: boolean;
    saltFree: boolean;
    sugarFree: boolean;
    mealReminders: boolean;
    waterIntakeGoal: number; // glasses per day
  };

  // Units
  units: {
    distance: "km" | "miles";
    weight: "kg" | "lbs";
    temperature: "celsius" | "fahrenheit";
  };
}
