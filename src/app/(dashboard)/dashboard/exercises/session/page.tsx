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
import {
  Play,
  Pause,
  SkipForward,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { useExerciseStore } from "@/stores";

// Mock exercise data - same as detail page
const MOCK_EXERCISES: Record<string, any> = {
  "1": {
    id: "1",
    name: "Chin Tucks",
    duration: 180,
    repetitions: 10,
    sets: 3,
    instructions: [
      "Sit or stand with your spine in a neutral position",
      "Keep your eyes level and looking forward",
      "Gently draw your chin straight back, creating a 'double chin'",
      "Hold this position for 5 seconds",
      "Return to starting position slowly",
      "Rest for 3 seconds between repetitions",
    ],
  },
  "2": {
    id: "2",
    name: "Wall Angels",
    duration: 240,
    repetitions: 12,
    sets: 2,
    instructions: [
      "Stand with your back against a wall",
      "Keep your feet about 6 inches away from the wall",
      "Press your lower back, upper back, and head against the wall",
      "Raise your arms to 90 degrees with elbows bent (goal post position)",
      "Slowly slide your arms up the wall as high as comfortable",
      "Slide back down to starting position",
      "Keep all contact points touching the wall throughout",
    ],
  },
  "3": {
    id: "3",
    name: "Cat-Cow Stretch",
    duration: 120,
    repetitions: 8,
    sets: 2,
    instructions: [
      "Start on hands and knees (tabletop position)",
      "Hands should be directly under shoulders, knees under hips",
      "Inhale: Drop belly toward floor, lift chest and tailbone (Cow)",
      "Look slightly upward, keeping neck long",
      "Exhale: Round spine toward ceiling, tuck chin to chest (Cat)",
      "Draw navel toward spine",
      "Continue alternating between Cat and Cow with your breath",
    ],
  },
  "4": {
    id: "4",
    name: "Doorway Chest Stretch",
    duration: 180,
    repetitions: undefined,
    sets: 3,
    instructions: [
      "Stand in a doorway with feet shoulder-width apart",
      "Place forearms on each side of the door frame",
      "Elbows should be at 90 degrees, level with shoulders",
      "Step forward with one foot until you feel a stretch in chest",
      "Keep spine neutral and core engaged",
      "Hold stretch for 30 seconds",
      "Step back to release, rest 10 seconds, then repeat",
    ],
  },
  "5": {
    id: "5",
    name: "Prone Cobra",
    duration: 90,
    repetitions: 8,
    sets: 2,
    instructions: [
      "Lie face down on floor with arms at your sides",
      "Legs should be straight and together",
      "Rotate arms so thumbs point up toward ceiling",
      "Squeeze shoulder blades together",
      "Lift chest and arms off floor simultaneously",
      "Keep neck neutral (look at floor)",
      "Hold for 5-10 seconds",
      "Lower down slowly with control",
    ],
  },
};

function ExerciseSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get("exerciseId");
  const { startSession, endSession, activeSession } = useExerciseStore();

  const [isActive, setIsActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [painLevel, setPainLevel] = useState<number | null>(null);

  const exercise = exerciseId ? MOCK_EXERCISES[exerciseId] : null;

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
    setIsActive(!isActive);
  };

  const handleNextStep = () => {
    if (currentStep < exercise.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextRep = () => {
    if (exercise.repetitions) {
      if (currentRep < exercise.repetitions) {
        setCurrentRep(currentRep + 1);
      } else if (currentSet < exercise.sets) {
        // Move to next set
        setCurrentSet(currentSet + 1);
        setCurrentRep(1);
      }
    }
  };

  const handleCompleteSession = async () => {
    if (!painLevel) {
      alert("Please rate your current pain level before completing");
      return;
    }

    await endSession();
    router.push("/dashboard/exercises");
  };

  const handleEndSession = async () => {
    if (confirm("Are you sure you want to end this session?")) {
      await endSession();
      router.push("/dashboard/exercises");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = exercise?.repetitions
    ? (((currentSet - 1) * exercise.repetitions + currentRep) /
        (exercise.sets * exercise.repetitions)) *
      100
    : (elapsedTime / exercise?.duration) * 100;

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

  const isComplete = exercise.repetitions
    ? currentSet === exercise.sets && currentRep === exercise.repetitions
    : elapsedTime >= exercise.duration;

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
              Step {currentStep + 1} of {exercise.instructions.length}
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
                disabled={currentStep === exercise.instructions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            {exercise.instructions[currentStep]}
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
