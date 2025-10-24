/**
 * Advanced Analytics Engine
 *
 * Cross-store data analysis for health insights:
 * - Pain vs Exercise correlation
 * - Diet compliance vs Pain levels
 * - Medication adherence impact
 * - Sitting tolerance trends
 * - Weekly/monthly aggregate reports
 * - Predictive insights
 */

import { dbManager, STORES } from "./db";
import type { PainLog } from "@/types/pain";
import type { ExerciseSession } from "@/types/exercise";
import type { DietLog, WaterLog } from "@/types/diet";
import type { MedicationLog } from "@/types/medication";

// Analytics result types
export interface PainExerciseCorrelation {
  period: { start: Date; end: Date };
  totalSessions: number;
  averagePainBefore: number;
  averagePainAfter: number;
  painReduction: number; // percentage
  mostEffectiveExercises: {
    exerciseId: string;
    sessionCount: number;
    avgPainReduction: number;
  }[];
  insights: string[];
}

export interface DietPainCorrelation {
  period: { start: Date; end: Date };
  averageCompliance: number;
  averagePainLevel: number;
  correlationStrength: "strong" | "moderate" | "weak" | "none";
  daysAnalyzed: number;
  insights: string[];
  dayByDayData: {
    date: Date;
    compliance: number;
    painLevel: number;
  }[];
}

export interface MedicationAdherenceImpact {
  period: { start: Date; end: Date };
  overallAdherence: number;
  averagePainLevel: number;
  adherenceImpact: "positive" | "neutral" | "negative";
  missedDosesPainIncrease: number;
  insights: string[];
}

export interface SittingToleranceTrend {
  period: { start: Date; end: Date };
  dataPoints: {
    date: Date;
    tolerance: number; // minutes
    painLevel: number;
  }[];
  trend: "improving" | "stable" | "declining";
  averageTolerance: number;
  changePercentage: number;
  insights: string[];
}

export interface WeeklyReport {
  weekStarting: Date;
  weekEnding: Date;

  pain: {
    averageLevel: number;
    lowestLevel: number;
    highestLevel: number;
    totalLogs: number;
    trend: "improving" | "stable" | "worsening";
  };

  exercise: {
    totalSessions: number;
    totalMinutes: number;
    completionRate: number;
    mostFrequentDay: string;
  };

  diet: {
    averageCompliance: number;
    averageWaterIntake: number;
    daysTracked: number;
  };

  medication: {
    adherenceRate: number;
    missedDoses: number;
    onTimeRate: number;
  };

  highlights: string[];
  recommendations: string[];
}

export interface PredictiveInsight {
  category: "pain" | "exercise" | "diet" | "medication";
  pattern: string;
  confidence: "high" | "medium" | "low";
  prediction: string;
  recommendation: string;
  basedOn: string;
}

/**
 * Analyze correlation between pain levels and exercise sessions
 */
export async function analyzePainExerciseCorrelation(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PainExerciseCorrelation> {
  try {
    // Get exercise sessions
    const sessionStore = await dbManager.getStore<ExerciseSession>(
      STORES.EXERCISE_SESSIONS
    );
    if (!sessionStore) {
      return {
        period: { start: startDate, end: endDate },
        totalSessions: 0,
        averagePainBefore: 0,
        averagePainAfter: 0,
        painReduction: 0,
        mostEffectiveExercises: [],
        insights: [],
      };
    }

    const range = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const sessions = await sessionStore.getAllByIndex("userId_date", range);

    // Get pain logs
    const painStore = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
    if (!painStore) {
      return {
        period: { start: startDate, end: endDate },
        totalSessions: sessions.length,
        averagePainBefore: 0,
        averagePainAfter: 0,
        painReduction: 0,
        mostEffectiveExercises: [],
        insights: [],
      };
    }

    const painRange = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const painLogs = await painStore.getAllByIndex(
      "userId_timestamp",
      painRange
    );

    // Calculate pain before/after exercise
    let totalPainBefore = 0;
    let totalPainAfter = 0;
    let validSessions = 0;

    sessions.forEach((session) => {
      if (session.painDuring !== undefined && session.painAfter !== undefined) {
        totalPainBefore += session.painDuring;
        totalPainAfter += session.painAfter;
        validSessions++;
      }
    });

    const avgPainBefore =
      validSessions > 0 ? totalPainBefore / validSessions : 0;
    const avgPainAfter = validSessions > 0 ? totalPainAfter / validSessions : 0;
    const painReduction =
      avgPainBefore > 0
        ? ((avgPainBefore - avgPainAfter) / avgPainBefore) * 100
        : 0;

    // Find most effective exercises
    const exerciseImpact = new Map<
      string,
      { count: number; totalReduction: number }
    >();

    sessions.forEach((session) => {
      if (session.painDuring !== undefined && session.painAfter !== undefined) {
        const reduction = session.painDuring - session.painAfter;
        const routineId = session.routineId || "unknown";

        const existing = exerciseImpact.get(routineId) || {
          count: 0,
          totalReduction: 0,
        };
        exerciseImpact.set(routineId, {
          count: existing.count + 1,
          totalReduction: existing.totalReduction + reduction,
        });
      }
    });

    const mostEffective = Array.from(exerciseImpact.entries())
      .map(([exerciseId, data]) => ({
        exerciseId,
        sessionCount: data.count,
        avgPainReduction: data.count > 0 ? data.totalReduction / data.count : 0,
      }))
      .sort((a, b) => b.avgPainReduction - a.avgPainReduction)
      .slice(0, 5);

    // Generate insights
    const insights: string[] = [];

    if (painReduction > 20) {
      insights.push(
        `Excellent! Exercise reduces your pain by ${painReduction.toFixed(
          1
        )}% on average.`
      );
    } else if (painReduction > 10) {
      insights.push(
        `Exercise shows moderate pain reduction of ${painReduction.toFixed(
          1
        )}%.`
      );
    } else if (painReduction > 0) {
      insights.push(
        `Exercise shows minimal pain reduction. Consider adjusting your routine.`
      );
    } else {
      insights.push(
        `No clear pain reduction observed. Consult with your physiotherapist.`
      );
    }

    if (validSessions < 5) {
      insights.push("More exercise sessions needed for accurate analysis.");
    }

    if (mostEffective.length > 0 && mostEffective[0].avgPainReduction > 1) {
      insights.push(
        `Your most effective routine shows ${mostEffective[0].avgPainReduction.toFixed(
          1
        )} point pain reduction.`
      );
    }

    return {
      period: { start: startDate, end: endDate },
      totalSessions: sessions.length,
      averagePainBefore: Math.round(avgPainBefore * 10) / 10,
      averagePainAfter: Math.round(avgPainAfter * 10) / 10,
      painReduction: Math.round(painReduction * 10) / 10,
      mostEffectiveExercises: mostEffective,
      insights,
    };
  } catch (error) {
    console.error("Failed to analyze pain-exercise correlation:", error);
    throw error;
  }
}

/**
 * Analyze correlation between diet compliance and pain levels
 */
export async function analyzeDietPainCorrelation(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DietPainCorrelation> {
  try {
    // Get diet logs
    const dietStore = await dbManager.getStore<DietLog>(STORES.DIET_ENTRIES);
    if (!dietStore) {
      return {
        period: { start: startDate, end: endDate },
        averageCompliance: 0,
        averagePainLevel: 0,
        correlationStrength: "none",
        daysAnalyzed: 0,
        insights: [],
        dayByDayData: [],
      };
    }

    const range = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const dietLogs = await dietStore.getAllByIndex("userId_date", range);

    // Get pain logs
    const painStore = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
    if (!painStore) {
      return {
        period: { start: startDate, end: endDate },
        averageCompliance: 0,
        averagePainLevel: 0,
        correlationStrength: "none",
        daysAnalyzed: 0,
        insights: [],
        dayByDayData: [],
      };
    }

    const painRange = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const painLogs = await painStore.getAllByIndex(
      "userId_timestamp",
      painRange
    );

    // Group pain logs by date
    const painByDate = new Map<string, number[]>();
    painLogs.forEach((log) => {
      const dateKey = new Date(log.timestamp).toISOString().split("T")[0];
      const existing = painByDate.get(dateKey) || [];
      existing.push(log.level);
      painByDate.set(dateKey, existing);
    });

    // Calculate average pain per date
    const avgPainByDate = new Map<string, number>();
    painByDate.forEach((levels, date) => {
      const avg = levels.reduce((sum, l) => sum + l, 0) / levels.length;
      avgPainByDate.set(date, avg);
    });

    // Build day-by-day data
    const dayByDayData = dietLogs
      .map((dietLog) => {
        const dateKey = new Date(dietLog.date).toISOString().split("T")[0];
        const painLevel = avgPainByDate.get(dateKey) || 0;

        return {
          date: dietLog.date,
          compliance: dietLog.summary.compliance,
          painLevel,
        };
      })
      .filter((d) => d.painLevel > 0); // Only include days with pain data

    // Calculate correlation
    const totalCompliance = dayByDayData.reduce(
      (sum, d) => sum + d.compliance,
      0
    );
    const totalPain = dayByDayData.reduce((sum, d) => sum + d.painLevel, 0);
    const avgCompliance =
      dayByDayData.length > 0 ? totalCompliance / dayByDayData.length : 0;
    const avgPain =
      dayByDayData.length > 0 ? totalPain / dayByDayData.length : 0;

    // Simple correlation: compare high compliance days vs low compliance days
    const highComplianceDays = dayByDayData.filter((d) => d.compliance >= 80);
    const lowComplianceDays = dayByDayData.filter((d) => d.compliance < 60);

    const avgPainHighCompliance =
      highComplianceDays.length > 0
        ? highComplianceDays.reduce((sum, d) => sum + d.painLevel, 0) /
          highComplianceDays.length
        : 0;

    const avgPainLowCompliance =
      lowComplianceDays.length > 0
        ? lowComplianceDays.reduce((sum, d) => sum + d.painLevel, 0) /
          lowComplianceDays.length
        : 0;

    const painDifference = avgPainLowCompliance - avgPainHighCompliance;

    let correlationStrength: "strong" | "moderate" | "weak" | "none";
    if (painDifference > 2) correlationStrength = "strong";
    else if (painDifference > 1) correlationStrength = "moderate";
    else if (painDifference > 0.5) correlationStrength = "weak";
    else correlationStrength = "none";

    // Generate insights
    const insights: string[] = [];

    if (correlationStrength === "strong") {
      insights.push(
        `Strong correlation found! Better diet compliance reduces pain by ${painDifference.toFixed(
          1
        )} points on average.`
      );
    } else if (correlationStrength === "moderate") {
      insights.push(
        `Moderate correlation: Diet compliance appears to help reduce pain levels.`
      );
    } else if (correlationStrength === "weak") {
      insights.push(
        `Weak correlation: Diet may have minor impact on pain levels.`
      );
    } else {
      insights.push(
        `No clear correlation between diet compliance and pain levels detected.`
      );
    }

    if (avgCompliance >= 80) {
      insights.push(
        `Excellent diet compliance! Keep following Dr. Manthena's principles.`
      );
    } else if (avgCompliance >= 60) {
      insights.push(`Good diet compliance. Aim for 80%+ for better results.`);
    } else {
      insights.push(
        `Diet compliance needs improvement. Consider meal planning.`
      );
    }

    if (dayByDayData.length < 7) {
      insights.push("Track more days for accurate diet-pain analysis.");
    }

    return {
      period: { start: startDate, end: endDate },
      averageCompliance: Math.round(avgCompliance),
      averagePainLevel: Math.round(avgPain * 10) / 10,
      correlationStrength,
      daysAnalyzed: dayByDayData.length,
      insights,
      dayByDayData: dayByDayData.slice(-30), // Last 30 days
    };
  } catch (error) {
    console.error("Failed to analyze diet-pain correlation:", error);
    throw error;
  }
}

/**
 * Analyze medication adherence impact on pain
 */
export async function analyzeMedicationAdherenceImpact(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<MedicationAdherenceImpact> {
  try {
    // Get medication logs
    const medLogStore = await dbManager.getStore<MedicationLog>(
      STORES.MEDICATION_LOGS
    );
    if (!medLogStore) {
      return {
        period: { start: startDate, end: endDate },
        overallAdherence: 0,
        averagePainLevel: 0,
        adherenceImpact: "neutral",
        missedDosesPainIncrease: 0,
        insights: [],
      };
    }

    const range = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const medLogs = await medLogStore.getAllByIndex(
      "userId_scheduledTime",
      range
    );

    // Get pain logs
    const painStore = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
    if (!painStore) {
      return {
        period: { start: startDate, end: endDate },
        overallAdherence: 0,
        averagePainLevel: 0,
        adherenceImpact: "neutral",
        missedDosesPainIncrease: 0,
        insights: [],
      };
    }

    const painRange = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const painLogs = await painStore.getAllByIndex(
      "userId_timestamp",
      painRange
    );

    // Calculate adherence
    const totalScheduled = medLogs.length;
    const taken = medLogs.filter((l) => l.status === "taken").length;
    const missed = medLogs.filter((l) => l.status === "missed").length;
    const adherence = totalScheduled > 0 ? (taken / totalScheduled) * 100 : 0;

    // Calculate average pain
    const totalPain = painLogs.reduce((sum, log) => sum + log.level, 0);
    const avgPain = painLogs.length > 0 ? totalPain / painLogs.length : 0;

    // Compare pain on missed dose days vs taken dose days
    const painByDate = new Map<string, { pain: number[]; missed: boolean }>();

    painLogs.forEach((log) => {
      const dateKey = new Date(log.timestamp).toISOString().split("T")[0];
      const existing = painByDate.get(dateKey) || { pain: [], missed: false };
      existing.pain.push(log.level);
      painByDate.set(dateKey, existing);
    });

    medLogs.forEach((log) => {
      if (log.status === "missed") {
        const dateKey = new Date(log.scheduledTime).toISOString().split("T")[0];
        const existing = painByDate.get(dateKey);
        if (existing) {
          existing.missed = true;
        }
      }
    });

    const missedDoseDays = Array.from(painByDate.values()).filter(
      (d) => d.missed
    );
    const takenDoseDays = Array.from(painByDate.values()).filter(
      (d) => !d.missed
    );

    const avgPainMissedDays =
      missedDoseDays.length > 0
        ? missedDoseDays.reduce(
            (sum, d) => sum + d.pain.reduce((s, p) => s + p, 0) / d.pain.length,
            0
          ) / missedDoseDays.length
        : 0;

    const avgPainTakenDays =
      takenDoseDays.length > 0
        ? takenDoseDays.reduce(
            (sum, d) => sum + d.pain.reduce((s, p) => s + p, 0) / d.pain.length,
            0
          ) / takenDoseDays.length
        : 0;

    const missedDosesPainIncrease = avgPainMissedDays - avgPainTakenDays;

    let adherenceImpact: "positive" | "neutral" | "negative";
    if (missedDosesPainIncrease < -0.5) adherenceImpact = "negative";
    else if (missedDosesPainIncrease > 0.5) adherenceImpact = "positive";
    else adherenceImpact = "neutral";

    // Generate insights
    const insights: string[] = [];

    if (adherence >= 90) {
      insights.push(
        `Excellent medication adherence at ${Math.round(adherence)}%!`
      );
    } else if (adherence >= 75) {
      insights.push(
        `Good medication adherence. Aim for 90%+ for best results.`
      );
    } else {
      insights.push(
        `Medication adherence needs improvement (${Math.round(
          adherence
        )}%). Set reminders!`
      );
    }

    if (adherenceImpact === "positive" && missedDosesPainIncrease > 1) {
      insights.push(
        `Missing medications increases pain by ${missedDosesPainIncrease.toFixed(
          1
        )} points. Stay consistent!`
      );
    } else if (adherenceImpact === "neutral") {
      insights.push(
        `No clear pain difference on missed medication days. Continue monitoring.`
      );
    }

    if (missed > 5) {
      insights.push(
        `${missed} missed doses detected. Consider setting multiple reminders.`
      );
    }

    return {
      period: { start: startDate, end: endDate },
      overallAdherence: Math.round(adherence),
      averagePainLevel: Math.round(avgPain * 10) / 10,
      adherenceImpact,
      missedDosesPainIncrease: Math.round(missedDosesPainIncrease * 10) / 10,
      insights,
    };
  } catch (error) {
    console.error("Failed to analyze medication adherence impact:", error);
    throw error;
  }
}

/**
 * Generate weekly summary report
 */
export async function generateWeeklyReport(
  userId: string,
  weekStartDate: Date
): Promise<WeeklyReport> {
  try {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    // Pain analysis
    const painStore = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
    if (!painStore) {
      return {
        weekStarting: weekStartDate,
        weekEnding: weekEndDate,
        pain: {
          averageLevel: 0,
          lowestLevel: 0,
          highestLevel: 0,
          totalLogs: 0,
          trend: "stable",
        },
        exercise: {
          totalSessions: 0,
          totalMinutes: 0,
          completionRate: 0,
          mostFrequentDay: "",
        },
        diet: { averageCompliance: 0, averageWaterIntake: 0, daysTracked: 0 },
        medication: { adherenceRate: 0, missedDoses: 0, onTimeRate: 0 },
        highlights: [],
        recommendations: [],
      };
    }

    const painRange = IDBKeyRange.bound(
      [userId, weekStartDate],
      [userId, weekEndDate]
    );
    const painLogs = await painStore.getAllByIndex(
      "userId_timestamp",
      painRange
    );

    const avgPain =
      painLogs.length > 0
        ? painLogs.reduce((sum, log) => sum + log.level, 0) / painLogs.length
        : 0;
    const lowestPain =
      painLogs.length > 0 ? Math.min(...painLogs.map((l) => l.level)) : 0;
    const highestPain =
      painLogs.length > 0 ? Math.max(...painLogs.map((l) => l.level)) : 0;

    // Determine pain trend (compare first half vs second half of week)
    const midWeek = new Date(weekStartDate);
    midWeek.setDate(midWeek.getDate() + 3);
    const firstHalf = painLogs.filter((l) => new Date(l.timestamp) < midWeek);
    const secondHalf = painLogs.filter((l) => new Date(l.timestamp) >= midWeek);

    const avgFirstHalf =
      firstHalf.length > 0
        ? firstHalf.reduce((sum, l) => sum + l.level, 0) / firstHalf.length
        : 0;
    const avgSecondHalf =
      secondHalf.length > 0
        ? secondHalf.reduce((sum, l) => sum + l.level, 0) / secondHalf.length
        : 0;

    let painTrend: "improving" | "stable" | "worsening";
    if (avgSecondHalf < avgFirstHalf - 0.5) painTrend = "improving";
    else if (avgSecondHalf > avgFirstHalf + 0.5) painTrend = "worsening";
    else painTrend = "stable";

    // Exercise analysis
    const sessionStore = await dbManager.getStore<ExerciseSession>(
      STORES.EXERCISE_SESSIONS
    );
    if (!sessionStore) {
      return {
        weekStarting: weekStartDate,
        weekEnding: weekEndDate,
        pain: {
          averageLevel: avgPain,
          lowestLevel: lowestPain,
          highestLevel: highestPain,
          totalLogs: painLogs.length,
          trend: painTrend,
        },
        exercise: {
          totalSessions: 0,
          totalMinutes: 0,
          completionRate: 0,
          mostFrequentDay: "None",
        },
        diet: { averageCompliance: 0, averageWaterIntake: 0, daysTracked: 0 },
        medication: { adherenceRate: 0, missedDoses: 0, onTimeRate: 0 },
        highlights: [],
        recommendations: [],
      };
    }

    const sessionRange = IDBKeyRange.bound(
      [userId, weekStartDate],
      [userId, weekEndDate]
    );
    const sessions = await sessionStore.getAllByIndex(
      "userId_date",
      sessionRange
    );

    const totalMinutes = sessions.reduce((sum, s) => sum + s.totalDuration, 0);
    const completedSessions = sessions.filter(
      (s) => s.status === "completed"
    ).length;
    const completionRate =
      sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 0;

    // Find most frequent exercise day
    const dayCount = new Map<string, number>();
    sessions.forEach((s) => {
      const day = new Date(s.date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      dayCount.set(day, (dayCount.get(day) || 0) + 1);
    });
    const mostFrequentDay =
      dayCount.size > 0
        ? Array.from(dayCount.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : "None";

    // Diet analysis
    const dietStore = await dbManager.getStore<DietLog>(STORES.DIET_ENTRIES);
    if (!dietStore) {
      return {
        weekStarting: weekStartDate,
        weekEnding: weekEndDate,
        pain: {
          averageLevel: avgPain,
          lowestLevel: lowestPain,
          highestLevel: highestPain,
          totalLogs: painLogs.length,
          trend: painTrend,
        },
        exercise: {
          totalSessions: sessions.length,
          totalMinutes,
          completionRate,
          mostFrequentDay,
        },
        diet: { averageCompliance: 0, averageWaterIntake: 0, daysTracked: 0 },
        medication: { adherenceRate: 0, missedDoses: 0, onTimeRate: 0 },
        highlights: [],
        recommendations: [],
      };
    }

    const dietRange = IDBKeyRange.bound(
      [userId, weekStartDate],
      [userId, weekEndDate]
    );
    const dietLogs = await dietStore.getAllByIndex("userId_date", dietRange);

    const avgCompliance =
      dietLogs.length > 0
        ? dietLogs.reduce((sum, l) => sum + l.summary.compliance, 0) /
          dietLogs.length
        : 0;

    // Water intake
    const waterStore = await dbManager.getStore<WaterLog>(STORES.DIET_ENTRIES);
    if (!waterStore) {
      return {
        weekStarting: weekStartDate,
        weekEnding: weekEndDate,
        pain: {
          averageLevel: avgPain,
          lowestLevel: lowestPain,
          highestLevel: highestPain,
          totalLogs: painLogs.length,
          trend: painTrend,
        },
        exercise: {
          totalSessions: sessions.length,
          totalMinutes,
          completionRate,
          mostFrequentDay,
        },
        diet: {
          averageCompliance: avgCompliance,
          averageWaterIntake: 0,
          daysTracked: dietLogs.length,
        },
        medication: { adherenceRate: 0, missedDoses: 0, onTimeRate: 0 },
        highlights: [],
        recommendations: [],
      };
    }

    const waterLogs = await waterStore.getAllByIndex("userId_date", dietRange);
    const avgWater =
      waterLogs.length > 0
        ? waterLogs.reduce((sum, l) => sum + l.glasses, 0) / waterLogs.length
        : 0;

    // Medication analysis
    const medLogStore = await dbManager.getStore<MedicationLog>(
      STORES.MEDICATION_LOGS
    );
    if (!medLogStore) {
      return {
        weekStarting: weekStartDate,
        weekEnding: weekEndDate,
        pain: {
          averageLevel: avgPain,
          lowestLevel: lowestPain,
          highestLevel: highestPain,
          totalLogs: painLogs.length,
          trend: painTrend,
        },
        exercise: {
          totalSessions: sessions.length,
          totalMinutes,
          completionRate,
          mostFrequentDay,
        },
        diet: {
          averageCompliance: avgCompliance,
          averageWaterIntake: avgWater,
          daysTracked: dietLogs.length,
        },
        medication: { adherenceRate: 0, missedDoses: 0, onTimeRate: 0 },
        highlights: [],
        recommendations: [],
      };
    }

    const medRange = IDBKeyRange.bound(
      [userId, weekStartDate],
      [userId, weekEndDate]
    );
    const medLogs = await medLogStore.getAllByIndex(
      "userId_scheduledTime",
      medRange
    );

    const taken = medLogs.filter((l) => l.status === "taken").length;
    const missed = medLogs.filter((l) => l.status === "missed").length;
    const adherenceRate =
      medLogs.length > 0 ? (taken / medLogs.length) * 100 : 0;

    const onTime = medLogs.filter(
      (l) =>
        l.status === "taken" &&
        l.actualTime &&
        Math.abs(
          new Date(l.actualTime).getTime() - new Date(l.scheduledTime).getTime()
        ) <
          30 * 60 * 1000
    ).length;
    const onTimeRate = taken > 0 ? (onTime / taken) * 100 : 0;

    // Generate highlights and recommendations
    const highlights: string[] = [];
    const recommendations: string[] = [];

    if (painTrend === "improving") {
      highlights.push("🎉 Pain levels are improving this week!");
    } else if (painTrend === "worsening") {
      highlights.push("⚠️ Pain levels increased this week");
      recommendations.push(
        "Review your routine and consult your healthcare provider"
      );
    }

    if (completedSessions >= 5) {
      highlights.push(
        `💪 Excellent! Completed ${completedSessions} exercise sessions`
      );
    } else if (completedSessions < 3) {
      recommendations.push(
        "Try to complete at least 3-4 exercise sessions per week"
      );
    }

    if (avgCompliance >= 80) {
      highlights.push(
        `🥗 Great diet compliance at ${Math.round(avgCompliance)}%`
      );
    } else {
      recommendations.push(
        "Improve diet compliance for better pain management"
      );
    }

    if (adherenceRate >= 90) {
      highlights.push(
        `💊 Excellent medication adherence at ${Math.round(adherenceRate)}%`
      );
    } else if (adherenceRate < 75) {
      recommendations.push("Set medication reminders to improve adherence");
    }

    if (avgWater >= 8) {
      highlights.push("💧 Meeting daily water intake goals");
    } else {
      recommendations.push(
        `Increase water intake (currently ${Math.round(avgWater)} glasses/day)`
      );
    }

    return {
      weekStarting: weekStartDate,
      weekEnding: weekEndDate,
      pain: {
        averageLevel: Math.round(avgPain * 10) / 10,
        lowestLevel: lowestPain,
        highestLevel: highestPain,
        totalLogs: painLogs.length,
        trend: painTrend,
      },
      exercise: {
        totalSessions: sessions.length,
        totalMinutes: Math.round(totalMinutes),
        completionRate: Math.round(completionRate),
        mostFrequentDay,
      },
      diet: {
        averageCompliance: Math.round(avgCompliance),
        averageWaterIntake: Math.round(avgWater * 10) / 10,
        daysTracked: dietLogs.length,
      },
      medication: {
        adherenceRate: Math.round(adherenceRate),
        missedDoses: missed,
        onTimeRate: Math.round(onTimeRate),
      },
      highlights,
      recommendations,
    };
  } catch (error) {
    console.error("Failed to generate weekly report:", error);
    throw error;
  }
}

/**
 * Generate predictive insights based on historical patterns
 */
export async function generatePredictiveInsights(
  userId: string,
  lookbackDays: number = 30
): Promise<PredictiveInsight[]> {
  const insights: PredictiveInsight[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lookbackDays);

  try {
    // Analyze exercise patterns
    const sessionStore = await dbManager.getStore<ExerciseSession>(
      STORES.EXERCISE_SESSIONS
    );
    if (!sessionStore) return insights;

    const sessionRange = IDBKeyRange.bound(
      [userId, startDate],
      [userId, endDate]
    );
    const sessions = await sessionStore.getAllByIndex(
      "userId_date",
      sessionRange
    );

    // Pattern: Exercise consistency
    const sessionsPerWeek = sessions.length / (lookbackDays / 7);
    if (sessionsPerWeek < 2) {
      insights.push({
        category: "exercise",
        pattern: "Low exercise frequency detected",
        confidence: "high",
        prediction: "Pain levels may increase without regular exercise",
        recommendation:
          "Aim for 3-4 exercise sessions per week for optimal pain management",
        basedOn: `${sessions.length} sessions in ${lookbackDays} days`,
      });
    }

    // Analyze medication patterns
    const medLogStore = await dbManager.getStore<MedicationLog>(
      STORES.MEDICATION_LOGS
    );
    if (!medLogStore) return insights;

    const medRange = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const medLogs = await medLogStore.getAllByIndex(
      "userId_scheduledTime",
      medRange
    );

    const adherence =
      medLogs.length > 0
        ? (medLogs.filter((l) => l.status === "taken").length /
            medLogs.length) *
          100
        : 0;

    if (adherence < 75 && medLogs.length > 10) {
      insights.push({
        category: "medication",
        pattern: "Inconsistent medication adherence",
        confidence: "high",
        prediction: "Poor adherence may lead to inadequate symptom control",
        recommendation: "Enable medication reminders and set up a routine",
        basedOn: `${Math.round(
          adherence
        )}% adherence over ${lookbackDays} days`,
      });
    }

    // Analyze diet patterns
    const dietStore = await dbManager.getStore<DietLog>(STORES.DIET_ENTRIES);
    if (!dietStore) return insights;

    const dietRange = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const dietLogs = await dietStore.getAllByIndex("userId_date", dietRange);

    const avgCompliance =
      dietLogs.length > 0
        ? dietLogs.reduce((sum, l) => sum + l.summary.compliance, 0) /
          dietLogs.length
        : 0;

    if (avgCompliance < 60 && dietLogs.length > 5) {
      insights.push({
        category: "diet",
        pattern: "Low diet compliance trend",
        confidence: "medium",
        prediction: "Poor diet compliance may worsen inflammation and pain",
        recommendation:
          "Meal prep on weekends to follow Dr. Manthena's principles more easily",
        basedOn: `${Math.round(avgCompliance)}% average compliance`,
      });
    }

    // Pattern: Pain trends
    const painStore = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
    if (!painStore) return insights;

    const painRange = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
    const painLogs = await painStore.getAllByIndex(
      "userId_timestamp",
      painRange
    );

    if (painLogs.length > 14) {
      // Compare recent week vs previous weeks
      const recent7Days = new Date();
      recent7Days.setDate(recent7Days.getDate() - 7);

      const recentPainLogs = painLogs.filter(
        (l) => new Date(l.timestamp) >= recent7Days
      );
      const olderPainLogs = painLogs.filter(
        (l) => new Date(l.timestamp) < recent7Days
      );

      const recentAvg =
        recentPainLogs.length > 0
          ? recentPainLogs.reduce((sum, l) => sum + l.level, 0) /
            recentPainLogs.length
          : 0;
      const olderAvg =
        olderPainLogs.length > 0
          ? olderPainLogs.reduce((sum, l) => sum + l.level, 0) /
            olderPainLogs.length
          : 0;

      if (recentAvg > olderAvg + 1) {
        insights.push({
          category: "pain",
          pattern: "Pain levels trending upward",
          confidence: "high",
          prediction: "Without intervention, pain may continue to worsen",
          recommendation:
            "Review recent activities and consult your healthcare provider if trend continues",
          basedOn: `Recent average: ${recentAvg.toFixed(
            1
          )}, Previous average: ${olderAvg.toFixed(1)}`,
        });
      } else if (recentAvg < olderAvg - 1) {
        insights.push({
          category: "pain",
          pattern: "Pain levels improving",
          confidence: "high",
          prediction: "Continue current routine for sustained improvement",
          recommendation:
            "Maintain your current exercise, diet, and medication schedule",
          basedOn: `Recent average: ${recentAvg.toFixed(
            1
          )}, Previous average: ${olderAvg.toFixed(1)}`,
        });
      }
    }

    return insights;
  } catch (error) {
    console.error("Failed to generate predictive insights:", error);
    return insights;
  }
}
