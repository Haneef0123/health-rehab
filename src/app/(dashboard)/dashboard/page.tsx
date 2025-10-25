"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PainLogForm } from "@/components/pain/pain-log-form";
import {
  Activity,
  HeartPulse,
  TrendingUp,
  AlertCircle,
  Plus,
  Timer,
  Dumbbell,
  ArrowRight,
  Loader2,
  LineChart,
  AlertTriangle,
  Calendar,
  Droplet,
} from "lucide-react";
import {
  useUserStore,
  usePainStore,
  useExerciseStore,
  useDietStore,
} from "@/stores";
import { analyzeFlareUpCauses } from "@/lib/analytics";
import type { FlareUpCause } from "@/lib/analytics";

export default function DashboardPage() {
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flareUpCauses, setFlareUpCauses] = useState<FlareUpCause[]>([]);
  const [missedDietDays, setMissedDietDays] = useState<Date[]>([]);

  const { user } = useUserStore();
  const { logs: painLogs, _isHydrated: painHydrated } = usePainStore();
  const {
    activeSession,
    sessions,
    _isHydrated: exerciseHydrated,
  } = useExerciseStore();
  const {
    meals,
    waterLogs,
    getMissedDietDays,
    _isHydrated: dietHydrated,
  } = useDietStore();

  // Load data on mount - only fetch analytics and computed data
  useEffect(() => {
    const loadData = async () => {
      // Wait for all stores to hydrate
      if (!painHydrated || !exerciseHydrated || !dietHydrated) {
        return;
      }

      setLoading(true);
      try {
        // Load flare-up causes
        const endDate = new Date();
        const startDate = new Date(
          endDate.getTime() - 14 * 24 * 60 * 60 * 1000
        );
        const causes = await analyzeFlareUpCauses(
          user?.id || "user-1",
          startDate,
          endDate
        );
        setFlareUpCauses(causes);

        // Load missed diet days (last 7 days)
        const dietStart = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const missed = await getMissedDietDays(dietStart, endDate);
        setMissedDietDays(missed);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [
    painHydrated,
    exerciseHydrated,
    dietHydrated,
    user?.id,
    getMissedDietDays,
  ]);

  // Calculate current pain level (most recent log from today)
  const currentPainLevel = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = painLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
    if (todayLogs.length === 0) return 0;
    return todayLogs[todayLogs.length - 1].level;
  }, [painLogs]);

  // Calculate today's exercise sessions
  const todaySessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    }).length;
  }, [sessions]);

  // Calculate weekly pain reduction
  const weeklyPainReduction = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentLogs = painLogs.filter(
      (log) => new Date(log.timestamp) >= weekAgo
    );
    if (recentLogs.length < 2) return 0;

    // Calculate average for first half and second half of the week
    const midpoint = Math.floor(recentLogs.length / 2);
    const firstHalf = recentLogs.slice(0, midpoint);
    const secondHalf = recentLogs.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

    const firstAvg =
      firstHalf.reduce((sum, log) => sum + log.level, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, log) => sum + log.level, 0) / secondHalf.length;

    return Math.round(((firstAvg - secondAvg) / firstAvg) * 100);
  }, [painLogs]);

  // Get last 14 days of pain logs for chart
  const painChartData = useMemo(() => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return painLogs
      .filter((log) => new Date(log.timestamp) >= twoWeeksAgo)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .slice(-14);
  }, [painLogs]);

  // Get upcoming exercise routines (next 3 days)
  // For now, show recent sessions as "routines"
  const upcomingRoutines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get recent completed sessions (last 7 days)
    const recentSessions = sessions
      .filter((s) => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return (
          sessionDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) &&
          s.status === "completed"
        );
      })
      .slice(0, 3);

    return recentSessions.map((s) => ({
      id: s.id,
      name: `Exercise Session`,
      exercises: s.completed || [],
      frequency: "Recent",
      isActive: true,
    }));
  }, [sessions]);

  // Calculate diet compliance percentage
  const dietCompliance = useMemo(() => {
    const totalDays = 7;
    const missedCount = missedDietDays.length;
    return Math.round(((totalDays - missedCount) / totalDays) * 100);
  }, [missedDietDays]);

  // Calculate today's water intake
  const todayWaterIntake = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = waterLogs.find((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    return todayLog?.glasses || 0;
  }, [waterLogs]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] || "Haneef"}! 👋
          </h1>
          <p className="mt-1 text-gray-600">
            Let's track your recovery progress today
          </p>
        </div>
        <Button
          variant="default"
          className="gap-2"
          onClick={() => setShowQuickLog(true)}
        >
          <Plus className="h-4 w-4" />
          Quick Log
        </Button>
      </div>

      {/* Current status cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current Pain Level */}
        <Card className="border-l-4 border-l-accent-500 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Pain</CardTitle>
            <HeartPulse className="h-4 w-4 text-accent-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  {currentPainLevel === 0
                    ? "No data"
                    : `${currentPainLevel}/10`}
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {currentPainLevel === 0
                ? "Log your pain"
                : currentPainLevel <= 3
                ? "Mild - Great progress!"
                : currentPainLevel <= 6
                ? "Moderate - Stay consistent"
                : "Severe - Take it easy"}
            </p>
          </CardContent>
        </Card>

        {/* Today's Exercises */}
        <Card className="border-l-4 border-l-primary-500 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Exercises
            </CardTitle>
            <Activity className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : activeSession ? (
                "Active"
              ) : (
                `${todaySessions}/3`
              )}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {activeSession ? "Session in progress" : "Sessions completed"}
            </p>
          </CardContent>
        </Card>

        {/* Sitting Tolerance */}
        <Card className="border-l-4 border-l-secondary-500 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Sitting Tolerance
            </CardTitle>
            <Timer className="h-4 w-4 text-secondary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {user?.medicalProfile.sittingTolerance || 15}
              <span className="text-lg text-gray-500"> min</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">Current capacity</p>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="border-l-4 border-l-success-500 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  {weeklyPainReduction > 0 ? "+" : ""}
                  {weeklyPainReduction}%
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-600">Pain reduction</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid - Pain Trend & Flare-up Causes */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pain Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <LineChart className="h-4 w-4" /> Pain Trend (Last 14 Days)
              </CardTitle>
              <CardDescription className="mt-1">
                Track your pain levels over time
              </CardDescription>
            </div>
            <Link href="/dashboard/pain">
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {painChartData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <LineChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pain data available</p>
              </div>
            ) : (
              <div className="flex gap-1 h-24 items-end">
                {painChartData.map((log, i) => {
                  const height = (log.level / 10) * 100;
                  const color =
                    log.level >= 7
                      ? "bg-red-500"
                      : log.level >= 4
                      ? "bg-orange-500"
                      : "bg-green-500";
                  return (
                    <div
                      key={log.id}
                      className={`flex-1 ${color} rounded-t transition-all hover:opacity-80`}
                      style={{ height: `${height}%`, minHeight: "4px" }}
                      title={`${new Date(
                        log.timestamp
                      ).toLocaleDateString()}: Level ${log.level}`}
                    />
                  );
                })}
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>2 weeks ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Flare-Up Causes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Top Flare-Up
              Triggers
            </CardTitle>
            <CardDescription>Main causes of high pain</CardDescription>
          </CardHeader>
          <CardContent>
            {flareUpCauses.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">
                Insufficient high-pain data
              </p>
            ) : (
              <ul className="space-y-2">
                {flareUpCauses.map((cause) => (
                  <li
                    key={cause.trigger}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="font-medium truncate flex-1">
                      {cause.trigger}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {cause.occurrences}×
                      </span>
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{
                            width: `${
                              (cause.occurrences /
                                flareUpCauses[0].occurrences) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diet & Exercise Schedule Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Diet Compliance */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-500" /> Diet Compliance
              </CardTitle>
              <CardDescription>Last 7 days tracking</CardDescription>
            </div>
            <Link href="/dashboard/diet">
              <Button variant="ghost" size="sm">
                View Diet
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="text-4xl font-bold text-gray-900">
                  {dietCompliance}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Compliance rate</p>
              </div>
              <div className="flex-1">
                {missedDietDays.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-orange-800">
                      {missedDietDays.length} day
                      {missedDietDays.length > 1 ? "s" : ""} without logging
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Keep tracking to maintain progress
                    </p>
                  </div>
                )}
                {missedDietDays.length === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-800">
                      Perfect tracking!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      All days logged this week
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Exercise Schedule */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" /> Upcoming
                Exercises
              </CardTitle>
              <CardDescription>Scheduled routines</CardDescription>
            </div>
            <Link href="/dashboard/exercises">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingRoutines.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">
                No active routines scheduled
              </p>
            ) : (
              <ul className="space-y-2">
                {upcomingRoutines.map((routine) => (
                  <li
                    key={routine.id}
                    className="flex items-start gap-2 text-xs"
                  >
                    <Dumbbell className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{routine.name}</p>
                      <p className="text-gray-500">
                        {routine.exercises.length} exercises
                      </p>
                    </div>
                    <span className="text-gray-600 whitespace-nowrap">
                      {routine.frequency}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Exercise Start Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <Dumbbell className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <CardTitle>Quick Exercise Start</CardTitle>
                  <CardDescription>Begin your exercise session</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSession ? (
              <div className="rounded-lg border border-success-200 bg-success-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-success-900">
                      Session in Progress
                    </p>
                    <p className="text-sm text-success-700">
                      Keep going, you're doing great!
                    </p>
                  </div>
                  <Link href="/dashboard/exercises">
                    <Button size="sm" className="gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Start a new exercise session to track your recovery progress.
                  Choose from recommended exercises or create your own routine.
                </p>
                <Link href="/dashboard/exercises">
                  <Button className="w-full gap-2">
                    <Activity className="h-4 w-4" />
                    Start Exercise Session
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest health logs</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Recent Activity */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                10m
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Pain log recorded
                </p>
                <p className="text-xs text-gray-500">Level 4 - Neck area</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100 text-xs font-semibold text-success-700">
                2h
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Exercise completed
                </p>
                <p className="text-xs text-gray-500">
                  Cervical stretches - 15 min
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-xs font-semibold text-secondary-700">
                4h
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Meal logged</p>
                <p className="text-xs text-gray-500">
                  Breakfast - Oil-free meal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical disclaimer */}
      <Card className="border-l-4 border-l-warning-500 bg-warning-50">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning-600" />
            <div>
              <CardTitle className="text-base text-warning-900">
                Medical Disclaimer
              </CardTitle>
              <CardDescription className="text-warning-700">
                All exercise recommendations and health tracking should be
                cross-checked with your physiotherapist or orthopedist. This app
                is for tracking purposes only and not a substitute for
                professional medical advice.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Log Modal */}
      {showQuickLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <PainLogForm
                onClose={() => setShowQuickLog(false)}
                onSuccess={() => {
                  setShowQuickLog(false);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
