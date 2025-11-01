"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlertDialog } from "@/components/ui/alert-dialog";
import { useExerciseStore, useUserStore } from "@/stores";
import { toast } from "@/hooks/use-toast";
import { USER_ID_FALLBACK } from "@/lib/constants";
import {
  Play,
  Pause,
  SkipForward,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
  Loader2,
} from "lucide-react";

function ExerciseSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert, AlertDialog } = useAlertDialog();
  const exerciseId = searchParams.get("exerciseId");
  const { user } = useUserStore();
  const { exercises, startSession, endSession, activeSession, fetchExercises } =
    useExerciseStore();

  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load exercises on mount
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      try {
        await fetchExercises();
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load exercise",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadExercises();
  }, [fetchExercises]);

  const exercise = exercises.find((ex) => ex.id === exerciseId);

  useEffect(() => {
    if (!exercise || activeSession) return;

    // Start session with routineId (using exerciseId as placeholder)
    startSession(exerciseId || "");
  }, [exercise, exerciseId, startSession, activeSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggleTimer = () => {
    if (isActive) {
      // Pausing
      setIsActive(false);
      setIsPaused(true);
      toast({
        variant: "default",
        title: "Session Paused",
        description: "Take your time. Resume when ready.",
      });
    } else {
      // Starting or resuming
      setIsActive(true);
      if (isPaused) {
        setIsPaused(false);
        toast({
          variant: "success",
          title: "Session Resumed",
          description: "Keep going!",
        });
      }
    }
  };

  const handleNextStep = () => {
    if (
      exercise &&
      exercise.instructions &&
      currentStep < exercise.instructions.length - 1
    ) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextRep = () => {
    if (exercise?.repetitions) {
      if (currentRep < exercise.repetitions) {
        setCurrentRep(currentRep + 1);
      } else if (exercise.sets && currentSet < exercise.sets) {
        // Move to next set
        setCurrentSet(currentSet + 1);
        setCurrentRep(1);
      }
    }
  };

  const handleCompleteSession = async () => {
    if (!painLevel && painLevel !== 0) {
      showAlert({
        title: "Pain Level Required",
        description:
          "Please rate your current pain level before completing the session.",
        confirmText: "OK",
      });
      return;
    }

    try {
      await endSession();
      toast({
        variant: "success",
        title: "Session Complete",
        description: "Great job! Your progress has been saved.",
      });
      router.push("/dashboard/exercises");
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to complete session",
      });
    }
  };

  const handleEndSession = async () => {
    showAlert({
      title: "End Session Early?",
      description:
        "Are you sure you want to end this session? Your progress will be saved as partial.",
      confirmText: "Yes, End Session",
      cancelText: "Continue Exercising",
      onConfirm: async () => {
        try {
          await endSession();
          toast({
            variant: "success",
            title: "Session Ended",
            description: "Your partial progress has been saved.",
          });
          router.push("/dashboard/exercises");
        } catch (error) {
          toast({
            variant: "error",
            title: "Error",
            description: "Failed to end session",
          });
        }
      },
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    exercise?.repetitions && exercise?.sets
      ? (((currentSet - 1) * exercise.repetitions + currentRep) /
          (exercise.sets * exercise.repetitions)) *
        100
      : exercise?.duration
      ? (elapsedTime / exercise.duration) * 100
      : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Exercise Not Found</CardTitle>
            <CardDescription>
              Please select an exercise to start a session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/exercises")}>
              Back to Exercises
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isComplete =
    exercise.repetitions && exercise.sets
      ? currentSet === exercise.sets && currentRep === exercise.repetitions
      : exercise.duration
      ? elapsedTime >= exercise.duration
      : false;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
          <p className="text-sm text-muted-foreground">Active Session</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleEndSession}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {Math.min(Math.round(progressPercentage), 100)}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary-100">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer & Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-primary-500 mb-2" />
            <p className="text-3xl font-bold">{formatTime(elapsedTime)}</p>
            <p className="text-sm text-muted-foreground">Elapsed Time</p>
          </CardContent>
        </Card>

        {exercise.repetitions && (
          <>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-success mb-2" />
                <p className="text-3xl font-bold">
                  {currentRep} / {exercise.repetitions}
                </p>
                <p className="text-sm text-muted-foreground">Repetitions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Badge variant="default" className="text-2xl px-4 py-2 mb-2">
                  {currentSet} / {exercise.sets}
                </Badge>
                <p className="text-sm text-muted-foreground">Sets</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Current Instruction */}
      <Card className="border-l-4 border-l-primary-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Step {currentStep + 1} of {exercise.instructions?.length ?? 0}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextStep}
                disabled={
                  !exercise.instructions ||
                  currentStep >= exercise.instructions.length - 1
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            {exercise.instructions[currentStep] ?? "No instruction available"}
          </p>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={handleToggleTimer}
                className="gap-2 px-8"
              >
                {isActive ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    {elapsedTime > 0 ? "Resume" : "Start"}
                  </>
                )}
              </Button>

              {exercise.repetitions && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleNextRep}
                  className="gap-2 px-8"
                  disabled={isComplete}
                >
                  <SkipForward className="h-5 w-5" />
                  Next Rep
                </Button>
              )}
            </div>

            {/* Pain Level Check */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-error" />
                <label className="text-sm font-medium">
                  Current Pain Level (0-10)
                </label>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={painLevel === level ? "default" : "outline"}
                    onClick={() => setPainLevel(level)}
                    className="flex-1"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Warning */}
      <Card className="border-warning/50 bg-warning-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Safety Reminder</p>
              <p className="text-sm text-warning-800">
                Stop immediately if you experience sharp pain, numbness, or
                tingling. All exercises should be performed within your comfort
                zone.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Session Button */}
      {isComplete && (
        <Card className="border-success/50 bg-success-50">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-success" />
            <div>
              <h3 className="text-xl font-bold text-success-900">
                Exercise Complete!
              </h3>
              <p className="text-sm text-success-800 mt-1">
                Great job completing this exercise. How do you feel?
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleCompleteSession}
              className="w-full max-w-md mx-auto"
            >
              Complete Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}

export default function ExerciseSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </div>
      }
    >
      <ExerciseSessionContent />
    </Suspense>
  );
}
