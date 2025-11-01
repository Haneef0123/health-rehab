/**
 * API utility functions with error handling, retry logic, and timeouts
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = "APIError";
  }
}

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new APIError("Request timeout", undefined, true);
    }
    throw error;
  }
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: unknown, statusCode?: number): boolean {
  // Network errors are retryable
  if (error instanceof TypeError) return true;

  // Timeout errors are retryable
  if (error instanceof APIError && error.isRetryable) return true;

  // 5xx server errors are retryable
  if (statusCode && statusCode >= 500) return true;

  // 429 Too Many Requests is retryable
  if (statusCode === 429) return true;

  // 408 Request Timeout is retryable
  if (statusCode === 408) return true;

  return false;
}

/**
 * Calculate backoff delay with jitter
 */
function calculateBackoff(attempt: number, baseDelay: number = 1000): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return exponentialDelay + jitter;
}

interface RetryOptions {
  maxRetries?: number;
  timeout?: number;
  baseDelay?: number;
  shouldRetry?: (error: unknown, statusCode?: number) => boolean;
}

/**
 * Fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithTimeoutOptions = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    timeout = 10000,
    baseDelay = 1000,
    shouldRetry = isRetryableError,
  } = retryOptions;

  let lastError: unknown;
  let lastStatusCode: number | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, { ...options, timeout });

      // If response is not ok, check if we should retry
      if (!response.ok) {
        lastStatusCode = response.status;

        // For client errors (4xx), don't retry unless it's 408 or 429
        if (response.status >= 400 && response.status < 500) {
          if (response.status !== 408 && response.status !== 429) {
            throw new APIError(
              `HTTP ${response.status}: ${response.statusText}`,
              response.status,
              false
            );
          }
        }

        // For server errors (5xx), mark as retryable
        if (response.status >= 500) {
          lastError = new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            true
          );

          if (attempt < maxRetries && shouldRetry(lastError, lastStatusCode)) {
            const delay = calculateBackoff(attempt, baseDelay);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          throw lastError;
        }
      }

      return response;
    } catch (error) {
      lastError = error;

      // If this is the last attempt or error is not retryable, throw
      if (
        attempt >= maxRetries ||
        !shouldRetry(error, lastStatusCode)
      ) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = calculateBackoff(attempt, baseDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Type-safe API fetch with validation
 */
export async function apiRequest<T>(
  url: string,
  options: FetchWithTimeoutOptions = {},
  validator?: (data: unknown) => data is T
): Promise<T> {
  const response = await fetchWithRetry(url, options);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new APIError(
      `API request failed: ${errorText}`,
      response.status,
      false
    );
  }

  const data = await response.json();

  // If validator is provided, validate the response
  if (validator && !validator(data)) {
    throw new APIError(
      "API response validation failed",
      response.status,
      false
    );
  }

  return data;
}
