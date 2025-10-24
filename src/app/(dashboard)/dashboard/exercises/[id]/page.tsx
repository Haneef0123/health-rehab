"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExerciseStore, useUserStore } from "@/stores";
import { toast } from "@/hooks/use-toast";
import { USER_ID_FALLBACK } from "@/lib/constants";
import {
  Play,
  Clock,
  Target,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Info,
  Repeat,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";

// Mock exercise data - will be replaced with actual data from store/API
const MOCK_EXERCISES = {
  "1": {
    id: "1",
    name: "Chin Tucks",
    description:
      "Gentle exercise to restore cervical lordosis and strengthen deep neck flexors",
    category: "posture" as const,
    difficulty: "beginner" as const,
    duration: 180,
    repetitions: 10,
    sets: 3,
    targetAreas: ["cervical spine", "neck"],
    contraindications: ["acute neck pain", "severe disc herniation"],
    warnings: [
      "Stop if you feel sharp pain",
      "Keep movements slow and controlled",
    ],
    benefits: [
      "Improves neck posture",
      "Reduces forward head position",
      "Strengthens deep neck muscles",
    ],
    instructions: [
      "Sit or stand with your spine in a neutral position",
      "Keep your eyes level and looking forward",
      "Gently draw your chin straight back, creating a 'double chin'",
      "Hold this position for 5 seconds",
      "Return to starting position slowly",
      "Rest for 3 seconds between repetitions",
    ],
    modifications: [
      "Beginners: Start with 5 repetitions and build up gradually",
      "If sitting is difficult, perform while lying on your back",
      "Use a small towel roll behind your neck for support if needed",
    ],
    videoUrl: undefined,
    imageUrl: undefined,
  },
  "2": {
    id: "2",
    name: "Wall Angels",
    description:
      "Upper back and shoulder mobility exercise to counteract rounded shoulders",
    category: "mobility" as const,
    difficulty: "beginner" as const,
    duration: 240,
    repetitions: 12,
    sets: 2,
    targetAreas: ["upper back", "shoulders", "thoracic spine"],
    contraindications: ["shoulder impingement", "recent shoulder surgery"],
    warnings: [
      "Keep lower back against wall",
      "Don't force range of motion",
      "Stop if shoulders feel pinched",
    ],
    benefits: [
      "Improves thoracic extension",
      "Opens chest and shoulders",
      "Counteracts forward head posture",
    ],
    instructions: [
      "Stand with your back against a wall",
      "Keep your feet about 6 inches away from the wall",
      "Press your lower back, upper back, and head against the wall",
      "Raise your arms to 90 degrees with elbows bent (goal post position)",
      "Slowly slide your arms up the wall as high as comfortable",
      "Slide back down to starting position",
      "Keep all contact points touching the wall throughout",
    ],
    modifications: [
      "Beginners: Move feet further from wall to reduce difficulty",
      "If too difficult, perform lying on the floor instead",
      "Start with smaller range of motion and increase gradually",
    ],
    videoUrl: undefined,
    imageUrl: undefined,
  },
  "3": {
    id: "3",
    name: "Cat-Cow Stretch",
    description:
      "Gentle spinal mobility exercise that promotes flexion and extension",
    category: "stretching" as const,
    difficulty: "beginner" as const,
    duration: 120,
    repetitions: 8,
    sets: 2,
    targetAreas: ["entire spine", "neck", "lower back"],
    contraindications: ["acute back pain", "wrist injuries"],
    warnings: [
      "Move slowly and smoothly",
      "Don't force the stretch",
      "Keep knees hip-width apart",
    ],
    benefits: [
      "Increases spinal flexibility",
      "Reduces back stiffness",
      "Promotes spinal fluid circulation",
    ],
    instructions: [
      "Start on hands and knees (tabletop position)",
      "Hands should be directly under shoulders, knees under hips",
      "Inhale: Drop belly toward floor, lift chest and tailbone (Cow)",
      "Look slightly upward, keeping neck long",
      "Exhale: Round spine toward ceiling, tuck chin to chest (Cat)",
      "Draw navel toward spine",
      "Continue alternating between Cat and Cow with your breath",
    ],
    modifications: [
      "If wrists hurt, do this on forearms instead",
      "Can perform seated in a chair with hands on knees",
      "Reduce range of motion if any position causes discomfort",
    ],
    videoUrl: undefined,
    imageUrl: undefined,
  },
  "4": {
    id: "4",
    name: "Doorway Chest Stretch",
    description: "Stretches tight chest muscles and opens up rounded shoulders",
    category: "stretching" as const,
    difficulty: "beginner" as const,
    duration: 180,
    repetitions: undefined,
    sets: 3,
    targetAreas: ["chest", "shoulders", "anterior shoulder"],
    contraindications: ["shoulder dislocation history", "severe shoulder pain"],
    warnings: [
      "Don't bounce or force the stretch",
      "Keep core engaged",
      "Breathe normally throughout",
    ],
    benefits: [
      "Opens tight chest muscles",
      "Improves shoulder positioning",
      "Counteracts computer posture",
    ],
    instructions: [
      "Stand in a doorway with feet shoulder-width apart",
      "Place forearms on each side of the door frame",
      "Elbows should be at 90 degrees, level with shoulders",
      "Step forward with one foot until you feel a stretch in chest",
      "Keep spine neutral and core engaged",
      "Hold stretch for 30 seconds",
      "Step back to release, rest 10 seconds, then repeat",
    ],
    modifications: [
      "Adjust elbow height to target different chest fibers",
      "Can perform one arm at a time using a corner",
      "Reduce stretch intensity by stepping less far forward",
    ],
    videoUrl: undefined,
    imageUrl: undefined,
  },
  "5": {
    id: "5",
    name: "Prone Cobra",
    description:
      "Strengthens posterior chain and helps correct thoracic kyphosis",
    category: "strengthening" as const,
    difficulty: "intermediate" as const,
    duration: 90,
    repetitions: 8,
    sets: 2,
    targetAreas: ["upper back", "lower back", "glutes"],
    contraindications: ["severe back pain", "pregnancy", "herniated disc"],
    warnings: [
      "Keep movements controlled",
      "Don't hyperextend neck",
      "Stop if sharp pain occurs",
    ],
    benefits: [
      "Strengthens back extensors",
      "Improves posture",
      "Counteracts kyphosis",
    ],
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
    modifications: [
      "Beginners: Keep arms on floor, only lift chest",
      "Can place small pillow under hips for support",
      "Start with shorter hold times (3 seconds)",
    ],
    videoUrl: undefined,
    imageUrl: undefined,
  },
};

export default function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useUserStore();
  const { exercises, sessions, fetchExercises } = useExerciseStore();

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
          description: "Failed to load exercise details",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadExercises();
  }, [fetchExercises]);

  // Get exercise from store
  const exercise = exercises.find((ex) => ex.id === id);

  // Calculate performance stats
  const performanceStats = useMemo(() => {
    if (!exercise) return null;

    const exerciseSessions = sessions.filter((session) =>
      session.completed.some(
        (completion) =>
          completion.exerciseId === exercise.id && completion.completed
      )
    );

    const lastPerformed =
      exerciseSessions.length > 0
        ? new Date(
            Math.max(...exerciseSessions.map((s) => new Date(s.date).getTime()))
          )
        : null;

    // Calculate average pain during/after
    const painData = exerciseSessions
      .map((s) => ({
        during: s.painDuring,
        after: s.painAfter,
      }))
      .filter((p) => p.during !== undefined && p.after !== undefined);

    const avgPainDuring =
      painData.length > 0
        ? painData.reduce((sum, p) => sum + p.during, 0) / painData.length
        : 0;
    const avgPainAfter =
      painData.length > 0
        ? painData.reduce((sum, p) => sum + p.after, 0) / painData.length
        : 0;

    return {
      totalSessions: exerciseSessions.length,
      lastPerformed,
      avgPainDuring: avgPainDuring.toFixed(1),
      avgPainAfter: avgPainAfter.toFixed(1),
    };
  }, [exercise, sessions]);

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
              The exercise you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/exercises")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exercises
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartSession = () => {
    // TODO: Navigate to active session tracker
    router.push(`/dashboard/exercises/session?exerciseId=${exercise.id}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/exercises")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exercises
        </Button>

        <Button onClick={handleStartSession} size="lg" className="gap-2">
          <Play className="h-5 w-5" />
          Start Exercise
        </Button>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{exercise.name}</CardTitle>
              <CardDescription className="text-base">
                {exercise.description}
              </CardDescription>
            </div>
            <Badge
              variant={
                exercise.difficulty === "beginner"
                  ? "default"
                  : exercise.difficulty === "intermediate"
                  ? "secondary"
                  : "error"
              }
              className="text-sm"
            >
              {exercise.difficulty}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(exercise.duration / 60)} min{" "}
                {exercise.duration % 60}s
              </span>
            </div>
            {exercise.repetitions && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Repeat className="h-4 w-4" />
                <span>
                  {exercise.repetitions} reps × {exercise.sets} sets
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="capitalize">{exercise.category}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video/Image Placeholder */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {exercise.videoUrl || exercise.imageUrl ? (
              <img
                src={exercise.imageUrl || exercise.videoUrl}
                alt={exercise.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Play className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p className="text-sm">Video demonstration coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Target Areas */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.targetAreas.map((area) => (
                <Badge key={area} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Benefits
            </h3>
            <ul className="space-y-2">
              {exercise.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      {performanceStats && performanceStats.totalSessions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Performance Stats
            </CardTitle>
            <CardDescription>
              Track your progress with this exercise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Repeat className="h-4 w-4" />
                  <span>Total Sessions</span>
                </div>
                <div className="text-2xl font-bold">
                  {performanceStats.totalSessions}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Last Performed</span>
                </div>
                <div className="text-sm font-medium">
                  {performanceStats.lastPerformed
                    ? new Date(
                        performanceStats.lastPerformed
                      ).toLocaleDateString()
                    : "Never"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Avg Pain During</span>
                </div>
                <div className="text-2xl font-bold">
                  {performanceStats.avgPainDuring}/10
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Avg Pain After</span>
                </div>
                <div className="text-2xl font-bold">
                  {performanceStats.avgPainAfter}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Step-by-Step Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {exercise.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="text-sm pt-0.5">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Modifications Card */}
      {exercise.modifications && exercise.modifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Modifications & Variations
            </CardTitle>
            <CardDescription>
              Adapt this exercise to your comfort level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exercise.modifications.map((modification, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{modification}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Safety Information */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Contraindications */}
        {exercise.contraindications &&
          exercise.contraindications.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Contraindications
                </CardTitle>
                <CardDescription>Do NOT perform if you have:</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {exercise.contraindications.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-destructive text-lg leading-none">
                        •
                      </span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        {/* Warnings */}
        {exercise.warnings && exercise.warnings.length > 0 && (
          <Card className="border-warning/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Important Warnings
              </CardTitle>
              <CardDescription>Keep these in mind:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {exercise.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-warning text-lg leading-none">•</span>
                    <span className="text-sm">{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Medical Disclaimer */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Medical Disclaimer:</strong> All exercises should be
            performed under guidance from a qualified physiotherapist or
            healthcare provider. Stop immediately if you experience sharp pain,
            numbness, or tingling. This app is for tracking purposes only and
            does not replace professional medical advice.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
        <Button onClick={handleStartSession} size="lg" className="flex-1 gap-2">
          <Play className="h-5 w-5" />
          Start Exercise
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/dashboard/exercises")}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
