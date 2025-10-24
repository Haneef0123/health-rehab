/**
 * Performance Monitoring Utilities
 * Track and report performance metrics for the Health Rehab app
 */

// Web Vitals thresholds (in milliseconds)
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint
  FID: 100, // First Input Delay
  CLS: 0.1, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint
  TTFB: 800, // Time to First Byte
};

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

// Report Web Vitals
export function reportWebVitals(metric: any) {
  const { name, value, rating } = metric;

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${name}:`, {
      value: Math.round(value),
      rating,
      threshold: THRESHOLDS[name as keyof typeof THRESHOLDS] || "N/A",
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    // You can integrate with your analytics service here
    // Example: Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag("event", name, {
        value: Math.round(value),
        metric_rating: rating,
        non_interaction: true,
      });
    }
  }
}

// Measure IndexedDB query performance
export async function measureDBQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - start;

    if (duration > 50) {
      console.warn(
        `[Performance] Slow DB query: ${queryName} took ${duration.toFixed(
          2
        )}ms`
      );
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `[Performance] DB query failed: ${queryName} after ${duration.toFixed(
        2
      )}ms`,
      error
    );
    throw error;
  }
}

// Measure component render time
export function measureRender(componentName: string) {
  if (typeof window === "undefined") return;

  const start = performance.now();

  return () => {
    const duration = performance.now() - start;

    if (duration > 100) {
      console.warn(
        `[Performance] Slow render: ${componentName} took ${duration.toFixed(
          2
        )}ms`
      );
    }
  };
}

// Get current performance metrics
export function getCurrentMetrics(): PerformanceMetric[] {
  if (typeof window === "undefined" || !window.performance) {
    return [];
  }

  const metrics: PerformanceMetric[] = [];
  const navigation = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;

  if (navigation) {
    // Time to First Byte
    const ttfb = navigation.responseStart - navigation.requestStart;
    metrics.push({
      name: "TTFB",
      value: ttfb,
      rating:
        ttfb < THRESHOLDS.TTFB
          ? "good"
          : ttfb < THRESHOLDS.TTFB * 2
          ? "needs-improvement"
          : "poor",
      timestamp: Date.now(),
    });

    // DOM Content Loaded
    const dcl =
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart;
    metrics.push({
      name: "DCL",
      value: dcl,
      rating: dcl < 1500 ? "good" : dcl < 3000 ? "needs-improvement" : "poor",
      timestamp: Date.now(),
    });

    // Page Load Time
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    metrics.push({
      name: "Load",
      value: loadTime,
      rating:
        loadTime < 2000
          ? "good"
          : loadTime < 4000
          ? "needs-improvement"
          : "poor",
      timestamp: Date.now(),
    });
  }

  return metrics;
}

// Log memory usage (if available)
export function logMemoryUsage() {
  if (typeof window === "undefined") return;

  const memory = (performance as any).memory;
  if (memory) {
    console.log("[Performance] Memory:", {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
}

// Check if app is running slow
export function isPerformanceSlow(): boolean {
  const metrics = getCurrentMetrics();
  return metrics.some((m) => m.rating === "poor");
}

// Export performance report
export function exportPerformanceReport(): string {
  const metrics = getCurrentMetrics();
  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    metrics,
    connection: (navigator as any).connection
      ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
        }
      : null,
  };

  return JSON.stringify(report, null, 2);
}
