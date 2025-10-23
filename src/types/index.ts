// Central type exports
export * from "./user";
export * from "./exercise";
export * from "./pain";
export * from "./diet";
export * from "./medication";
export * from "./progress";

// Common types used across the app
export type Status = "active" | "inactive" | "pending" | "completed";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Theme = "light" | "dark" | "system";

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form states
export type FormState = "idle" | "submitting" | "success" | "error";

// Loading states
export type LoadingState = "idle" | "loading" | "success" | "error";
