"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useUserStore } from "@/stores";
import {
  analyzePainExerciseCorrelation,
  analyzeDietPainCorrelation,
  analyzeMedicationAdherenceImpact,
  generateWeeklyReport,
  generatePredictiveInsights,
} from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComponentLoader } from "@/components/ui/loaders";
import { DataEmpty } from "@/components/ui/data-empty";
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Apple,
  Pill,
  Calendar,
  Lightbulb,
  RefreshCw,
  BarChart3,
  LineChart,
  Brain,
  AlertCircle,
  Dumbbell,
  Utensils,
  Sparkles,
} from "lucide-react";

type TimeRange = "week" | "month" | "3months";

// Safe date formatter for SSR
const formatDate = (date: Date | string): string => {
  if (typeof window === "undefined") return "";
  return new Date(date).toLocaleDateString();
};

export default function AnalyticsPage() {
  const { user } = useUserStore();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("pain-exercise");
  const [mounted, setMounted] = useState(false);

  // Analytics data state
  const [painExerciseData, setPainExerciseData] = useState<any>(null);
  const [dietPainData, setDietPainData] = useState<any>(null);
  const [medicationData, setMedicationData] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadAnalytics = async () => {
    // Skip during SSR
    if (typeof window === "undefined" || !user?.id) return;

    const now = new Date();
    let startDate = new Date();

    // Calculate date range
    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setDate(now.getDate() - 30);
        break;
      case "3months":
        startDate.setDate(now.getDate() - 90);
        break;
    }

    try {
      setLoading(true);

      // Load all analytics in parallel
      const [painExercise, dietPain, medication, insights] = await Promise.all([
        analyzePainExerciseCorrelation(user.id, startDate, now),
        analyzeDietPainCorrelation(user.id, startDate, now),
        analyzeMedicationAdherenceImpact(user.id, startDate, now),
        generatePredictiveInsights(user.id, timeRange === "week" ? 7 : 30),
      ]);

      setPainExerciseData(painExercise);
      setDietPainData(dietPain);
      setMedicationData(medication);
      setPredictiveInsights(insights);

      // Load weekly report if in week view
      if (timeRange === "week") {
        const weekStart = new Date();
        weekStart.setDate(now.getDate() - 7);
        const report = await generateWeeklyReport(user.id, weekStart);
        setWeeklyReport(report);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only load analytics if we're in the browser and have a user
    if (typeof window === "undefined" || !user?.id || !mounted) return;
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, timeRange, mounted]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  // Prevent SSR hydration mismatch
  if (!mounted) {
    return <ComponentLoader />;
  }

  if (loading && !painExerciseData) {
    return <ComponentLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of your health data
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === "week" ? "default" : "outline"}
          onClick={() => setTimeRange("week")}
          size="sm"
        >
          Last 7 Days
        </Button>
        <Button
          variant={timeRange === "month" ? "default" : "outline"}
          onClick={() => setTimeRange("month")}
          size="sm"
        >
          Last 30 Days
        </Button>
        <Button
          variant={timeRange === "3months" ? "default" : "outline"}
          onClick={() => setTimeRange("3months")}
          size="sm"
        >
          Last 3 Months
        </Button>
      </div>

      {/* Weekly Report (if week view) */}
      {timeRange === "week" && weeklyReport && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle>Weekly Report</CardTitle>
              </div>
              <Badge variant="secondary">
                {formatDate(weeklyReport.weekStart)} -{" "}
                {formatDate(weeklyReport.weekEnd)}
              </Badge>
            </div>
            <CardDescription>
              Your health summary for the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Highlights */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Highlights
              </h4>
              <div className="grid gap-2">
                {weeklyReport.highlights.map(
                  (highlight: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm bg-white dark:bg-gray-800 p-2 rounded"
                    >
                      <span className="text-lg">{highlight.charAt(0)}</span>
                      <span>{highlight.substring(2)}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Pain Metrics */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="text-xs text-muted-foreground">Avg Pain Level</p>
                <p className="text-2xl font-bold">
                  {weeklyReport.pain.averageLevel.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {weeklyReport.pain.trend}
                </p>
              </div>

              {/* Exercise Metrics */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="text-xs text-muted-foreground">
                  Exercise Sessions
                </p>
                <p className="text-2xl font-bold">
                  {weeklyReport.exercise.totalSessions}
                </p>
                <p className="text-xs text-muted-foreground">
                  {weeklyReport.exercise.completionRate}% completion
                </p>
              </div>

              {/* Diet Metrics */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="text-xs text-muted-foreground">Diet Compliance</p>
                <p className="text-2xl font-bold">
                  {weeklyReport.diet.averageCompliance}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {weeklyReport.diet.averageWaterIntake}ml water
                </p>
              </div>

              {/* Medication Metrics */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="text-xs text-muted-foreground">Med Adherence</p>
                <p className="text-2xl font-bold">
                  {weeklyReport.medication.adherenceRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {weeklyReport.medication.missedDoses} missed
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommendations
              </h4>
              <ul className="space-y-1 text-sm">
                {weeklyReport.recommendations.map(
                  (rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs
        defaultValue="pain-exercise"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="pain-exercise">
            <Activity className="h-4 w-4 mr-2" />
            Pain & Exercise
          </TabsTrigger>
          <TabsTrigger value="diet-pain">
            <Apple className="h-4 w-4 mr-2" />
            Diet & Pain
          </TabsTrigger>
          <TabsTrigger value="medication">
            <Pill className="h-4 w-4 mr-2" />
            Medication
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Pain-Exercise Correlation Tab */}
        <TabsContent value="pain-exercise" className="space-y-4">
          {!painExerciseData || painExerciseData.sessions === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <DataEmpty
                  icon={Dumbbell}
                  title="No Exercise Data"
                  description="Complete some exercise sessions with pain tracking to see correlations and insights about how exercise affects your pain levels."
                />
              </CardContent>
            </Card>
          ) : (
            painExerciseData && (
              <>
                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Pain Reduction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {painExerciseData.painReduction > 0 ? "-" : ""}
                        {Math.abs(painExerciseData.painReduction).toFixed(1)}%
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        {painExerciseData.painReduction > 0 ? (
                          <>
                            <TrendingDown className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Improving</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-3 w-3 text-red-600" />
                            <span className="text-red-600">
                              Needs attention
                            </span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Before Exercise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {painExerciseData.averagePainBefore.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average pain level
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        After Exercise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {painExerciseData.averagePainAfter.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average pain level
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Most Effective Exercises */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Most Effective Exercises
                    </CardTitle>
                    <CardDescription>
                      Exercises that reduce your pain the most
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {painExerciseData.mostEffectiveExercises.length > 0 ? (
                      <div className="space-y-3">
                        {painExerciseData.mostEffectiveExercises.map(
                          (exercise: any, idx: number) => (
                            <div
                              key={exercise.exerciseId}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-semibold">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {exercise.exerciseName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {exercise.sessions} sessions
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">
                                  -{exercise.avgPainReduction.toFixed(1)} pain
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  avg reduction
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No exercise data available yet</p>
                        <p className="text-sm">
                          Complete some exercise sessions to see insights
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {painExerciseData.insights.map(
                        (insight: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )
          )}
        </TabsContent>

        {/* Diet-Pain Correlation Tab */}
        <TabsContent value="diet-pain" className="space-y-4">
          {!dietPainData || dietPainData.daysAnalyzed === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <DataEmpty
                  icon={Utensils}
                  title="No Diet Data"
                  description="Log your meals and pain levels for a few days to see how different foods and eating patterns affect your pain."
                />
              </CardContent>
            </Card>
          ) : (
            dietPainData && (
              <>
                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Correlation Strength
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold capitalize">
                        {dietPainData.correlationStrength}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dietPainData.correlationStrength === "strong"
                          ? "Diet significantly impacts pain"
                          : dietPainData.correlationStrength === "moderate"
                          ? "Diet moderately impacts pain"
                          : dietPainData.correlationStrength === "weak"
                          ? "Some correlation detected"
                          : "No clear correlation"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        High Compliance Days
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {dietPainData.highCompliancePain.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg pain (≥80% compliance)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Low Compliance Days
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {dietPainData.lowCompliancePain.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg pain (&lt;60% compliance)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Chart (Simple visualization) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Daily Compliance Trend
                    </CardTitle>
                    <CardDescription>
                      Last 30 days of diet compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dietPainData.dayByDayData.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex gap-1 items-end h-32">
                          {dietPainData.dayByDayData
                            .slice(-30)
                            .map((day: any, idx: number) => {
                              const height = (day.compliance / 100) * 100;
                              const isGood = day.compliance >= 80;
                              const isBad = day.compliance < 60;
                              return (
                                <div
                                  key={idx}
                                  className="flex-1 relative group"
                                  style={{ height: "100%" }}
                                >
                                  <div
                                    className={`absolute bottom-0 w-full rounded-t transition-colors ${
                                      isGood
                                        ? "bg-green-500"
                                        : isBad
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                    }`}
                                    style={{ height: `${height}%` }}
                                  >
                                    <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                      {formatDate(day.date)}
                                      <br />
                                      {day.compliance}% compliance
                                      <br />
                                      Pain: {day.painLevel.toFixed(1)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {dietPainData.dayByDayData[0]?.date
                              ? formatDate(dietPainData.dayByDayData[0].date)
                              : ""}
                          </span>
                          <span>Today</span>
                        </div>
                        <div className="flex gap-4 text-xs justify-center">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Good (≥80%)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>Fair (60-79%)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Poor (&lt;60%)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No diet data available yet</p>
                        <p className="text-sm">
                          Log your meals to see insights
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {dietPainData.insights.map(
                        (insight: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )
          )}
        </TabsContent>

        {/* Medication Adherence Tab */}
        <TabsContent value="medication" className="space-y-4">
          {!medicationData || medicationData.daysAnalyzed === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <DataEmpty
                  icon={Pill}
                  title="No Medication Data"
                  description="Start tracking your medication adherence to see how it impacts your symptoms and recovery progress."
                />
              </CardContent>
            </Card>
          ) : (
            medicationData && (
              <>
                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Adherence Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {medicationData.overallAdherence}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {medicationData.overallAdherence >= 80
                          ? "Excellent adherence"
                          : medicationData.overallAdherence >= 60
                          ? "Good adherence"
                          : "Needs improvement"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Impact on Pain
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold capitalize">
                        {medicationData.adherenceImpact}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {medicationData.adherenceImpact === "positive"
                          ? "Medications are helping"
                          : medicationData.adherenceImpact === "negative"
                          ? "Review with doctor"
                          : "No clear impact yet"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Pain Difference
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {medicationData.missedDosesPainIncrease > 0 ? "+" : ""}
                        {medicationData.missedDosesPainIncrease.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pain on missed dose days
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Pain Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pain Level Comparison</CardTitle>
                    <CardDescription>
                      Average pain when medications are taken vs missed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Days with Medications Taken
                        </p>
                        <p className="text-4xl font-bold mt-2">
                          {medicationData.avgPainWithMeds.toFixed(1)}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Average pain level
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          Days with Missed Doses
                        </p>
                        <p className="text-4xl font-bold mt-2">
                          {medicationData.avgPainMissedDoses.toFixed(1)}
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Average pain level
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {medicationData.insights.map(
                        (insight: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )
          )}
        </TabsContent>

        {/* AI Predictive Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {predictiveInsights.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <DataEmpty
                  icon={Sparkles}
                  title="No Insights Available Yet"
                  description="Track your health data for at least a week to receive AI-powered predictions and personalized recommendations."
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Predictions & Recommendations
                </CardTitle>
                <CardDescription>
                  Pattern-based insights to help improve your health outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictiveInsights.length > 0 ? (
                  <div className="space-y-4">
                    {predictiveInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                              {insight.category}
                            </Badge>
                            <Badge
                              variant={
                                insight.confidence === "high"
                                  ? "default"
                                  : insight.confidence === "medium"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {insight.confidence} confidence
                            </Badge>
                          </div>
                        </div>
                        <h4 className="font-semibold mb-1">
                          {insight.pattern}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.prediction}
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            💡 Recommendation
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {insight.recommendation}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Based on: {insight.basedOn}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      Building Your Health Profile
                    </p>
                    <p className="text-sm mt-2">
                      We need more data to generate predictive insights
                    </p>
                    <p className="text-sm">
                      Keep logging your pain, exercises, diet, and medications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
