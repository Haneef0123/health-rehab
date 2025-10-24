/**
 * Validation utilities for form inputs across the app
 */

// Naturopathic food categories
export const NATUROPATHIC_CATEGORIES = [
  "fruit",
  "vegetable",
  "nut",
  "seed",
  "legume",
  "whole_grain",
] as const;

export const RAW_PREPARATIONS = ["raw", "steamed", "boiled"] as const;

export type NaturopathicCategory = (typeof NATUROPATHIC_CATEGORIES)[number];
export type RawPreparation = (typeof RAW_PREPARATIONS)[number];

/**
 * Check if a food category is naturopathic
 */
export function isNaturopathicFood(category: string): boolean {
  return NATUROPATHIC_CATEGORIES.includes(category as NaturopathicCategory);
}

/**
 * Check if preparation method counts as raw
 */
export function isRawPreparation(preparation: string): boolean {
  return RAW_PREPARATIONS.includes(preparation as RawPreparation);
}

/**
 * Validate pain level (1-10)
 */
export function validatePainLevel(level: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof level !== "number" || isNaN(level)) {
    return { valid: false, error: "Pain level must be a number" };
  }
  if (level < 1 || level > 10) {
    return { valid: false, error: "Pain level must be between 1 and 10" };
  }
  return { valid: true };
}

/**
 * Validate water amount (must be positive)
 */
export function validateWaterAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof amount !== "number" || isNaN(amount)) {
    return { valid: false, error: "Water amount must be a number" };
  }
  if (amount <= 0) {
    return { valid: false, error: "Water amount must be greater than 0" };
  }
  return { valid: true };
}

/**
 * Validate meal time format (HH:MM)
 */
export function validateMealTime(time: string): {
  valid: boolean;
  error?: string;
} {
  if (!time || typeof time !== "string") {
    return { valid: false, error: "Time is required" };
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return {
      valid: false,
      error: "Time must be in HH:MM format (e.g., 14:30)",
    };
  }

  return { valid: true };
}

/**
 * Validate date is not in future
 */
export function validateDate(date: Date | string): {
  valid: boolean;
  error?: string;
} {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: "Invalid date" };
  }

  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today

  if (dateObj > now) {
    return { valid: false, error: "Date cannot be in the future" };
  }

  return { valid: true };
}

/**
 * Validate non-empty string
 */
export function validateNonEmpty(
  value: string,
  fieldName = "Field"
): {
  valid: boolean;
  error?: string;
} {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

/**
 * Validate non-empty array
 */
export function validateNonEmptyArray<T>(
  array: T[],
  fieldName = "Items"
): {
  valid: boolean;
  error?: string;
} {
  if (!Array.isArray(array) || array.length === 0) {
    return {
      valid: false,
      error: `${fieldName} must contain at least one item`,
    };
  }
  return { valid: true };
}

/**
 * Validate exercise duration (must be positive)
 */
export function validateDuration(duration: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof duration !== "number" || isNaN(duration)) {
    return { valid: false, error: "Duration must be a number" };
  }
  if (duration <= 0) {
    return { valid: false, error: "Duration must be greater than 0" };
  }
  return { valid: true };
}

/**
 * Validate quantity (must be positive)
 */
export function validateQuantity(quantity: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof quantity !== "number" || isNaN(quantity)) {
    return { valid: false, error: "Quantity must be a number" };
  }
  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be greater than 0" };
  }
  return { valid: true };
}
