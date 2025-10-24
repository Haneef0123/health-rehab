"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PainLogForm } from "@/components/pain/pain-log-form";
import { usePainStore, useUserStore } from "@/stores";
import { toast } from "@/hooks/use-toast";
import { USER_ID_FALLBACK, DATE_RANGES } from "@/lib/constants";
import {
  Plus,
  Calendar,
  TrendingDown,
  TrendingUp,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { PAIN_SCALE } from "@/types/pain";

type DateRange = "week" | "month" | "all";

export default function PainPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const { user } = useUserStore();
  const { logs, currentPainLevel, fetchLogs, deleteLog } = usePainStore();

  // Initialize logs on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await fetchLogs();
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load pain logs",
        });
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchLogs]);

  // Filter logs by date range
  const filteredLogs = useMemo(() => {
    if (dateRange === "all") return logs;

    const now = new Date();
    const rangeStart = new Date();

    if (dateRange === "week") {
      rangeStart.setDate(now.getDate() - DATE_RANGES.WEEK);
    } else if (dateRange === "month") {
      rangeStart.setDate(now.getDate() - DATE_RANGES.MONTH);
    }

    return logs.filter((log) => new Date(log.timestamp) >= rangeStart);
  }, [logs, dateRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (filteredLogs.length === 0) {
      return {
        avgPain: 0,
        painFreeDays: 0,
        trend: 0,
        trendDirection: "stable" as "improving" | "worsening" | "stable",
      };
    }

    const avgPain =
      filteredLogs.reduce((sum, log) => sum + log.level, 0) /
      filteredLogs.length;

    // Count pain-free days (pain level 0-2)
    const painFreeDays = filteredLogs.filter((log) => log.level <= 2).length;

    // Calculate trend (compare first half vs second half)
    const midpoint = Math.floor(filteredLogs.length / 2);
    if (midpoint > 0) {
      const firstHalf = filteredLogs.slice(0, midpoint);
      const secondHalf = filteredLogs.slice(midpoint);

      const firstAvg =
        firstHalf.reduce((sum, log) => sum + log.level, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, log) => sum + log.level, 0) / secondHalf.length;

      const trend = ((firstAvg - secondAvg) / firstAvg) * 100;
      const trendDirection =
        trend > 5 ? "improving" : trend < -5 ? "worsening" : "stable";

      return { avgPain, painFreeDays, trend, trendDirection };
    }

    return {
      avgPain,
      painFreeDays,
      trend: 0,
      trendDirection: "stable" as const,
    };
  }, [filteredLogs]);

  // Handle delete log
  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteLog(logId);
      toast({
        variant: "success",
        title: "Log Deleted",
        description: "Pain log has been removed successfully",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to delete pain log",
      });
    }
  };

  const currentScale = PAIN_SCALE[currentPainLevel as keyof typeof PAIN_SCALE];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pain Tracking</h1>
          <p className="mt-1 text-gray-600">
            Monitor your pain levels and identify patterns
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Log Pain
        </Button>
      </div>

      {/* Current Pain Status */}
      <Card
        className="border-l-4"
        style={{ borderLeftColor: currentScale.color }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Pain Level</CardTitle>
              <CardDescription>Your most recent pain log</CardDescription>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
              style={{ backgroundColor: currentScale.color }}
            >
              {currentPainLevel}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  currentPainLevel <= 3
                    ? "success"
                    : currentPainLevel <= 6
                    ? "warning"
                    : "error"
                }
              >
                {currentScale.label}
              </Badge>
              <span className="text-sm text-gray-600">
                {currentScale.description}
              </span>
            </div>
            {currentPainLevel > 0 && currentPainLevel < 10 && (
              <p className="text-sm text-gray-500">
                {currentPainLevel <= 3
                  ? "Great progress! Keep up the good work."
                  : currentPainLevel <= 6
                  ? "Stay consistent with your exercises and rest."
                  : "Consider taking a break and consulting your physiotherapist."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pain Log Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <PainLogForm
                onClose={() => setShowForm(false)}
                onSuccess={() => {
                  setShowForm(false);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pain Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Date Range Selector */}
        <div className="sm:col-span-3 flex gap-2 justify-end">
          <Button
            variant={dateRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("week")}
          >
            Week
          </Button>
          <Button
            variant={dateRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("month")}
          >
            Month
          </Button>
          <Button
            variant={dateRange === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("all")}
          >
            All Time
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Pain</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {filteredLogs.length > 0
                    ? statistics.avgPain.toFixed(1)
                    : "0"}
                  /10
                </div>
                <p className="text-xs text-gray-600">
                  {dateRange === "week"
                    ? "Last 7 days"
                    : dateRange === "month"
                    ? "Last 30 days"
                    : "All time"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pain-Free Days
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statistics.painFreeDays}
                </div>
                <p className="text-xs text-gray-600">
                  {dateRange === "week"
                    ? "This week"
                    : dateRange === "month"
                    ? "This month"
                    : "All time"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            {statistics.trendDirection === "improving" ? (
              <TrendingDown className="h-4 w-4 text-success-500" />
            ) : statistics.trendDirection === "worsening" ? (
              <TrendingUp className="h-4 w-4 text-error-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-gray-400" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${
                    statistics.trendDirection === "improving"
                      ? "text-success-600"
                      : statistics.trendDirection === "worsening"
                      ? "text-error-600"
                      : "text-gray-600"
                  }`}
                >
                  {statistics.trend > 0 ? "+" : ""}
                  {statistics.trend.toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600 capitalize">
                  {statistics.trendDirection}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pain Logs</CardTitle>
          <CardDescription>Your pain tracking history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No pain logs yet
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Start tracking your pain to identify patterns and monitor
                progress
              </p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                Log Your First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.slice(0, 10).map((log) => {
                const logScale =
                  PAIN_SCALE[log.level as keyof typeof PAIN_SCALE];
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ backgroundColor: logScale.color }}
                    >
                      {log.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.level <= 3
                              ? "success"
                              : log.level <= 6
                              ? "warning"
                              : "error"
                          }
                        >
                          {logScale.label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {log.location && log.location.length > 0 && (
                        <p className="mt-1 text-sm text-gray-900">
                          <span className="font-medium">Location:</span>{" "}
                          {log.location.join(", ")}
                        </p>
                      )}
                      {log.triggers && log.triggers.length > 0 && (
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Triggers:</span>{" "}
                          {log.triggers.join(", ")}
                        </p>
                      )}
                      {log.notes && (
                        <p className="mt-1 text-sm text-gray-600">
                          {log.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
