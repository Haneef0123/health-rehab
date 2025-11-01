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
} from "lucide-react";
import {
  useUserStore,
  usePainStore,
  useExerciseStore,
  useDietStore,
} from "@/stores";

export default function DashboardPage() {
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useUserStore();
  const { logs: painLogs, fetchLogs } = usePainStore();
  const { activeSession, sessions } = useExerciseStore();
  const { meals, fetchMeals } = useDietStore();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchLogs(), fetchMeals()]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchLogs, fetchMeals]);

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
    const lastLog = todayLogs[todayLogs.length - 1];
    return lastLog?.level ?? 0;
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

    // Avoid division by zero - if firstAvg is 0, return 0
    if (firstAvg === 0) return 0;

    return Math.round(((firstAvg - secondAvg) / firstAvg) * 100);
  }, [painLogs]);

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
