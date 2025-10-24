/**
 * Application-wide constants
 */

// User fallback for cases where user.id is not yet available
export const USER_ID_FALLBACK = "user-local";

// Meal types
export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

// Food categories (must match Food interface in types/diet.ts)
export const FOOD_CATEGORIES = [
  "fruit",
  "vegetable",
  "grain",
  "legume",
  "nut",
  "seed",
  "herb",
  "spice",
  "other",
] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

// Food units (must match Food interface in types/diet.ts)
export const FOOD_UNITS = [
  "cup",
  "piece",
  "grams",
  "tablespoon",
  "teaspoon",
  "handful",
] as const;
export type FoodUnit = (typeof FOOD_UNITS)[number];

// Preparation methods (must match Food interface in types/diet.ts)
export const PREPARATION_METHODS = [
  "raw",
  "steamed",
  "boiled",
  "baked",
  "sprouted",
] as const;
export type PreparationMethod = (typeof PREPARATION_METHODS)[number];

// Naturopathic categories (subset of food categories)
export const NATUROPATHIC_CATEGORIES: readonly FoodCategory[] = [
  "fruit",
  "vegetable",
  "nut",
  "seed",
  "legume",
  "grain",
];

// Raw/healthy preparation methods
export const RAW_PREPARATIONS: readonly PreparationMethod[] = [
  "raw",
  "steamed",
  "boiled",
];

// Pain levels
export const MIN_PAIN_LEVEL = 1;
export const MAX_PAIN_LEVEL = 10;

// Water tracking
export const DEFAULT_WATER_GLASS_ML = 250;
export const DEFAULT_WATER_GOAL_ML = 2000;

// Date ranges for analytics
export const DATE_RANGES = {
  WEEK: 7,
  MONTH: 30,
  THREE_MONTHS: 90,
} as const;

// Schema version for data migrations
export const SCHEMA_VERSION = "1.0.0";

// Exercise session status
export const SESSION_STATUS = ["active", "completed", "abandoned"] as const;
export type SessionStatus = (typeof SESSION_STATUS)[number];

// Medication statuses
export const MEDICATION_LOG_STATUS = [
  "taken",
  "missed",
  "skipped",
  "pending",
] as const;
export type MedicationLogStatus = (typeof MEDICATION_LOG_STATUS)[number];

// Pain body parts (commonly tracked)
export const BODY_PARTS = [
  "neck",
  "upper_back",
  "lower_back",
  "shoulders",
  "head",
  "chest",
  "arms",
  "legs",
  "whole_body",
  "other",
] as const;
export type BodyPart = (typeof BODY_PARTS)[number];

// Exercise equipment
export const EXERCISE_EQUIPMENT = [
  "none",
  "mat",
  "resistance_band",
  "dumbbells",
  "foam_roller",
  "yoga_block",
  "pillow",
  "towel",
  "chair",
  "wall",
] as const;
export type ExerciseEquipment = (typeof EXERCISE_EQUIPMENT)[number];
