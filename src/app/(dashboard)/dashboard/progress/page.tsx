"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Calendar,
  Award,
  BarChart3,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    "week"
  );

  // Mock data for demonstration
  const painData = [
    { day: "Mon", level: 6 },
    { day: "Tue", level: 5 },
    { day: "Wed", level: 4 },
    { day: "Thu", level: 5 },
    { day: "Fri", level: 4 },
    { day: "Sat", level: 3 },
    { day: "Sun", level: 4 },
  ];

  const exerciseData = [
    { day: "Mon", completed: 2, total: 3 },
    { day: "Tue", completed: 3, total: 3 },
    { day: "Wed", completed: 2, total: 3 },
    { day: "Thu", completed: 3, total: 3 },
    { day: "Fri", completed: 2, total: 3 },
    { day: "Sat", completed: 1, total: 2 },
    { day: "Sun", completed: 2, total: 2 },
  ];

  const sittingData = [
    { day: "Mon", minutes: 12 },
    { day: "Tue", minutes: 15 },
    { day: "Wed", minutes: 18 },
    { day: "Thu", minutes: 15 },
    { day: "Fri", minutes: 20 },
    { day: "Sat", minutes: 22 },
    { day: "Sun", minutes: 18 },
  ];

  const goals = [
    {
      id: 1,
      title: "Reduce pain level to 3 or below",
      current: 4,
      target: 3,
      progress: 67,
      unit: "level",
    },
    {
      id: 2,
      title: "Increase sitting tolerance to 30 minutes",
      current: 18,
      target: 30,
      progress: 60,
      unit: "min",
    },
    {
      id: 3,
      title: "Complete 20 exercise sessions",
      current: 15,
      target: 20,
      progress: 75,
      unit: "sessions",
    },
    {
      id: 4,
      title: "Maintain 90% medication adherence",
      current: 85,
      target: 90,
      progress: 94,
      unit: "%",
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "7-Day Streak",
      description: "Completed exercises for 7 consecutive days",
      icon: "🔥",
      date: "Oct 20, 2025",
    },
    {
      id: 2,
      title: "Pain Warrior",
      description: "Reduced pain level by 3 points",
      icon: "💪",
      date: "Oct 15, 2025",
    },
    {
      id: 3,
      title: "Consistency Champion",
      description: "Logged pain levels every day for 30 days",
      icon: "🏆",
      date: "Oct 10, 2025",
    },
  ];

  // Calculate stats
  const avgPainLevel =
    painData.reduce((sum, d) => sum + d.level, 0) / painData.length;
  const painTrend = painData[painData.length - 1].level - painData[0].level;

  const exerciseCompletionRate =
    (exerciseData.reduce((sum, d) => sum + d.completed, 0) /
      exerciseData.reduce((sum, d) => sum + d.total, 0)) *
    100;

  const avgSittingTolerance =
    sittingData.reduce((sum, d) => sum + d.minutes, 0) / sittingData.length;
  const sittingTrend =
    sittingData[sittingData.length - 1].minutes - sittingData[0].minutes;

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Progress Analytics</h1>
        <p className="text-muted-foreground">
          Track your health metrics, goals, and achievements
        </p>
      </div>

      {/* Time range selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(["week", "month", "quarter"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === "week"
                ? "This Week"
                : range === "month"
                ? "This Month"
                : "Last 3 Months"}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg. Pain Level</p>
            {painTrend < 0 ? (
              <TrendingDown className="w-4 h-4 text-success" />
            ) : (
              <TrendingUp className="w-4 h-4 text-destructive" />
            )}
          </div>
          <p className="text-3xl font-bold mb-1">
            {avgPainLevel.toFixed(1)}/10
          </p>
          <p className="text-xs text-muted-foreground">
            {painTrend < 0 ? "↓" : "↑"} {Math.abs(painTrend).toFixed(1)} vs
            start
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Exercise Rate</p>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold mb-1">
            {exerciseCompletionRate.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">
            {exerciseData.reduce((sum, d) => sum + d.completed, 0)} of{" "}
            {exerciseData.reduce((sum, d) => sum + d.total, 0)} completed
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Sitting Tolerance</p>
            {sittingTrend > 0 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
          <p className="text-3xl font-bold mb-1">
            {avgSittingTolerance.toFixed(0)}m
          </p>
          <p className="text-xs text-muted-foreground">
            {sittingTrend > 0 ? "↑" : "↓"} {Math.abs(sittingTrend)}m vs start
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active Days</p>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold mb-1">7/7</p>
          <p className="text-xs text-muted-foreground">100% consistency</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pain level chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Pain Level Trend</h2>
              </div>
              <Badge
                variant={painTrend < 0 ? "success" : "error"}
                className="text-xs"
              >
                {painTrend < 0 ? "Improving" : "Monitor"}
              </Badge>
            </div>

            {/* Simple bar chart */}
            <div className="space-y-4">
              {painData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-12">{data.day}</span>
                  <div className="flex-1 relative">
                    <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          data.level <= 3
                            ? "bg-success"
                            : data.level <= 6
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                        style={{ width: `${(data.level / 10) * 100}%` }}
                      />
                    </div>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium">
                      {data.level}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pain Scale:</span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    Low (0-3)
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    Moderate (4-6)
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    High (7-10)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Exercise completion chart */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Exercise Completion</h2>
            </div>

            <div className="space-y-4">
              {exerciseData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-12">{data.day}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width: `${(data.completed / data.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16">
                        {data.completed}/{data.total}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sitting tolerance chart */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Sitting Tolerance</h2>
            </div>

            <div className="space-y-4">
              {sittingData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-12">{data.day}</span>
                  <div className="flex-1 relative">
                    <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${(data.minutes / 30) * 100}%` }}
                      />
                    </div>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium">
                      {data.minutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              Target: 30 minutes • Current goal:{" "}
              {avgSittingTolerance.toFixed(0)}m average
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Goals */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Active Goals</h2>
            </div>

            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.current} / {goal.target} {goal.unit}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        goal.progress >= 90
                          ? "bg-success"
                          : goal.progress >= 60
                          ? "bg-primary"
                          : "bg-warning"
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {goal.progress}% complete
                  </p>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4" variant="outline" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Set New Goal
            </Button>
          </Card>

          {/* Achievements */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Achievements</h2>
            </div>

            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4" variant="outline" size="sm">
              <Award className="w-4 h-4 mr-2" />
              View All
            </Button>
          </Card>

          {/* Insights */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Insights</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 border rounded-lg bg-success/10 border-success/20">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-success mb-1">
                      Pain Decreasing
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your pain levels have dropped 33% this week. Keep up with
                      your exercise routine!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-primary/10 border-primary/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary mb-1">
                      Sitting Improving
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your sitting tolerance increased by 67% this week. Great
                      progress!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-warning/10 border-warning/20">
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-warning mb-1">
                      Consistency Tip
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You&apos;re on a 7-day streak! Consistency is key to
                      long-term recovery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Export data */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Export Data</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Download PDF Report
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Export to CSV
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Share with Doctor
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
