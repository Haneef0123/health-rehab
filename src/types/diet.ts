// Diet and nutrition types (Dr. Manthena Satyanarayana Raju principles)
export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;

  // Plan details
  type: "daily" | "weekly" | "custom";
  startDate: Date;
  endDate?: Date;

  // Meals
  meals: Meal[];

  // Principles compliance
  principles: {
    oilFree: boolean;
    saltRestricted: boolean;
    sugarFree: boolean;
    rawFoodsIncluded: boolean;
    fastingIncluded: boolean;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  id: string;
  mealPlanId?: string;
  userId: string;

  // Meal details
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  scheduledTime: string; // HH:MM format

  // Foods
  foods: Food[];

  // Nutritional info
  nutrition: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fiber?: number;
    vitamins?: string[];
  };

  // Tracking
  consumed: boolean;
  consumedAt?: Date;
  rating?: number; // 1-5
  notes?: string;

  // Metadata
  date: Date;
  createdAt: Date;
}

export interface Food {
  id: string;
  name: string;
  category:
    | "fruit"
    | "vegetable"
    | "grain"
    | "legume"
    | "nut"
    | "seed"
    | "herb"
    | "spice"
    | "other";

  // Serving
  quantity: number;
  unit: "cup" | "piece" | "grams" | "tablespoon" | "teaspoon" | "handful";

  // Preparation
  preparation?: "raw" | "steamed" | "boiled" | "baked" | "sprouted";

  // Naturopathic properties
  properties?: {
    alkaline: boolean;
    heating: boolean;
    cooling: boolean;
    detoxifying: boolean;
  };

  // Restrictions
  warnings?: string[];
}

// Fasting schedule (important in naturopathy)
export interface FastingSchedule {
  id: string;
  userId: string;

  // Schedule
  type: "intermittent" | "juice" | "water" | "fruit" | "complete";
  startTime: string; // HH:MM
  endTime: string; // HH:MM

  // Days
  days: (
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  )[];

  // Status
  active: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Diet compliance tracking
export interface DietLog {
  id: string;
  userId: string;
  date: Date;

  // Daily summary
  summary: {
    mealsConsumed: number;
    mealsPlanned: number;
    compliance: number; // 0-100%
    principles: {
      oilFree: boolean;
      saltRestricted: boolean;
      sugarFree: boolean;
      adequateWater: boolean; // 8-10 glasses
      rawFoodsIncluded: boolean;
    };
  };

  // Fasting
  fastingCompleted?: boolean;
  fastingDuration?: number; // hours

  // Notes
  notes?: string;
  energyLevel?: number; // 1-10
  digestion?: "excellent" | "good" | "fair" | "poor";

  // Metadata
  createdAt: Date;
}

// Water intake tracking
export interface WaterLog {
  id: string;
  userId: string;
  date: Date;

  // Intake
  glasses: number; // target: 8-10
  milliliters: number;

  // Timing
  entries: {
    time: Date;
    amount: number; // ml
  }[];

  // Goal
  dailyGoal: number; // ml
  achieved: boolean;

  // Metadata
  createdAt: Date;
}

// Food restrictions and preferences
export interface DietaryRestrictions {
  userId: string;

  // Restrictions (based on medical conditions)
  restrictions: {
    foods: string[]; // specific foods to avoid
    categories: string[]; // categories to avoid
    reasons: string[]; // medical reasons
  };

  // Preferences
  preferences: {
    vegetarian: boolean;
    vegan: boolean;
    naturopathic: boolean;

    // Dr. Manthena principles
    oilFree: boolean;
    saltFree: boolean;
    sugarFree: boolean;
  };

  // Metadata
  updatedAt: Date;
}
