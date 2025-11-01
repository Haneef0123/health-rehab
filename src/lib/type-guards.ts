import type { Meal, WaterLog } from "@/types/diet";

/**
 * Type guard to check if an entry is a Meal
 */
export function isMeal(entry: unknown): entry is Meal {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "entryType" in entry &&
    entry.entryType === "meal" &&
    "id" in entry &&
    typeof entry.id === "string" &&
    "userId" in entry &&
    typeof entry.userId === "string"
  );
}

/**
 * Type guard to check if an entry is a WaterLog
 */
export function isWaterLog(entry: unknown): entry is WaterLog {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "entryType" in entry &&
    entry.entryType === "water" &&
    "id" in entry &&
    typeof entry.id === "string" &&
    "userId" in entry &&
    typeof entry.userId === "string"
  );
}

/**
 * Filter and validate meals from a mixed array
 */
export function filterMeals(entries: unknown[]): Meal[] {
  return entries.filter(isMeal);
}

/**
 * Filter and validate water logs from a mixed array
 */
export function filterWaterLogs(entries: unknown[]): WaterLog[] {
  return entries.filter(isWaterLog);
}
