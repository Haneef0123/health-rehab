"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  HeartPulse,
  TrendingUp,
  AlertCircle,
  Plus,
  Calendar,
  Timer,
} from "lucide-react";
import { useUserStore, usePainStore, useExerciseStore } from "@/stores";

export default function DashboardPage() {
  const { user } = useUserStore();
  const { currentPainLevel } = usePainStore();
  const { activeSession } = useExerciseStore();

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
        <Button variant="default" className="gap-2">
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
              {currentPainLevel}/10
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {currentPainLevel <= 3
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
              {activeSession ? "Active" : "0/3"}
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
            <div className="text-3xl font-bold text-gray-900">+12%</div>
            <p className="mt-1 text-xs text-gray-600">Pain reduction</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your exercises and reminders</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Exercise reminder */}
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <Activity className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">
                    Morning Stretches
                  </h4>
                  <Badge variant="warning" className="text-xs">
                    Due now
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  15 min • Neck & shoulder routine
                </p>
              </div>
              <Button size="sm" variant="outline">
                Start
              </Button>
            </div>

            {/* Pain log reminder */}
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100">
                <HeartPulse className="h-5 w-5 text-accent-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  Evening Pain Log
                </h4>
                <p className="text-sm text-gray-600">
                  Track your daily pain level
                </p>
              </div>
              <Button size="sm" variant="outline">
                Log
              </Button>
            </div>

            {/* Meal reminder */}
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 opacity-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100">
                <Calendar className="h-5 w-5 text-success-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Lunch</h4>
                <p className="text-sm text-gray-600">Naturopathic meal plan</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Completed
              </Badge>
            </div>
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
    </div>
  );
}
