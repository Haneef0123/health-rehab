"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  GripVertical,
  Save,
  ArrowLeft,
  Clock,
  Target,
  CheckCircle,
} from "lucide-react";

// Mock exercise data - same as exercises page
const MOCK_EXERCISES = [
  {
    id: "1",
    name: "Chin Tucks",
    category: "posture",
    difficulty: "beginner",
    duration: 180,
    repetitions: 10,
    sets: 3,
  },
  {
    id: "2",
    name: "Wall Angels",
    category: "mobility",
    difficulty: "beginner",
    duration: 240,
    repetitions: 12,
    sets: 2,
  },
  {
    id: "3",
    name: "Cat-Cow Stretch",
    category: "stretching",
    difficulty: "beginner",
    duration: 120,
    repetitions: 8,
    sets: 2,
  },
  {
    id: "4",
    name: "Doorway Chest Stretch",
    category: "stretching",
    difficulty: "beginner",
    duration: 180,
    repetitions: undefined,
    sets: 3,
  },
  {
    id: "5",
    name: "Prone Cobra",
    category: "strengthening",
    difficulty: "intermediate",
    duration: 90,
    repetitions: 8,
    sets: 2,
  },
];

interface RoutineExercise {
  exerciseId: string;
  order: number;
  duration?: number;
  repetitions?: number;
  sets?: number;
  restBetweenSets?: number;
  notes?: string;
}

export default function RoutineCreatorPage() {
  const router = useRouter();
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [frequency, setFrequency] = useState(3);
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>(
    []
  );
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const handleAddExercise = (exerciseId: string) => {
    const exercise = MOCK_EXERCISES.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    const newExercise: RoutineExercise = {
      exerciseId,
      order: selectedExercises.length,
      duration: exercise.duration,
      repetitions: exercise.repetitions,
      sets: exercise.sets,
      restBetweenSets: 30,
      notes: "",
    };

    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    // Reorder
    const reordered = updated.map((ex, idx) => ({ ...ex, order: idx }));
    setSelectedExercises(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...selectedExercises];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reordered = updated.map((ex, idx) => ({ ...ex, order: idx }));
    setSelectedExercises(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedExercises.length - 1) return;
    const updated = [...selectedExercises];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reordered = updated.map((ex, idx) => ({ ...ex, order: idx }));
    setSelectedExercises(reordered);
  };

  const handleUpdateExercise = (
    index: number,
    field: keyof RoutineExercise,
    value: any
  ) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      alert("Please enter a routine name");
      return;
    }

    if (selectedExercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    // TODO: Save to store/API
    const routine = {
      name: routineName,
      description: routineDescription,
      exercises: selectedExercises,
      frequency,
      isActive: true,
    };

    console.log("Saving routine:", routine);
    alert("Routine saved successfully!");
    router.push("/dashboard/exercises");
  };

  const totalDuration = selectedExercises.reduce((acc, ex) => {
    const exercise = MOCK_EXERCISES.find((e) => e.id === ex.exerciseId);
    return acc + (ex.duration || exercise?.duration || 0);
  }, 0);

  const availableExercises = MOCK_EXERCISES.filter(
    (ex) => !selectedExercises.some((sel) => sel.exerciseId === ex.id)
  );

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Exercise Routine</h1>
          <p className="text-muted-foreground mt-1">
            Build a custom sequence of exercises
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/exercises")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Routine Details */}
      <Card>
        <CardHeader>
          <CardTitle>Routine Details</CardTitle>
          <CardDescription>
            Basic information about your routine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Routine Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Neck Routine"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of this routine"
              value={routineDescription}
              onChange={(e) => setRoutineDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency (times per week)</Label>
            <Input
              id="frequency"
              type="number"
              min="1"
              max="7"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value) || 3)}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary-500" />
              <span className="font-medium">
                {Math.floor(totalDuration / 60)} min total
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary-500" />
              <span className="font-medium">
                {selectedExercises.length} exercise
                {selectedExercises.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>
                Add and order exercises in your routine
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowExercisePicker(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Exercise
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedExercises.length === 0 ? (
            <div className="py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">
                No exercises added yet. Click "Add Exercise" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedExercises.map((routineEx, index) => {
                const exercise = MOCK_EXERCISES.find(
                  (ex) => ex.id === routineEx.exerciseId
                );
                if (!exercise) return null;

                return (
                  <Card key={`${routineEx.exerciseId}-${index}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {/* Drag Handle & Order */}
                        <div className="flex flex-col items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === selectedExercises.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              ↓
                            </Button>
                          </div>
                        </div>

                        {/* Exercise Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {index + 1}. {exercise.name}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {exercise.category}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveExercise(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Customize Parameters */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {routineEx.repetitions !== undefined && (
                              <div className="space-y-1">
                                <Label className="text-xs">Reps</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={routineEx.repetitions}
                                  onChange={(e) =>
                                    handleUpdateExercise(
                                      index,
                                      "repetitions",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="h-8"
                                />
                              </div>
                            )}
                            <div className="space-y-1">
                              <Label className="text-xs">Sets</Label>
                              <Input
                                type="number"
                                min="1"
                                value={routineEx.sets}
                                onChange={(e) =>
                                  handleUpdateExercise(
                                    index,
                                    "sets",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Duration (s)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={routineEx.duration}
                                onChange={(e) =>
                                  handleUpdateExercise(
                                    index,
                                    "duration",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Rest (s)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={routineEx.restBetweenSets}
                                onChange={(e) =>
                                  handleUpdateExercise(
                                    index,
                                    "restBetweenSets",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-8"
                              />
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="space-y-1">
                            <Label className="text-xs">Notes (optional)</Label>
                            <Input
                              placeholder="Add any specific notes..."
                              value={routineEx.notes}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  index,
                                  "notes",
                                  e.target.value
                                )
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Exercise</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExercisePicker(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {availableExercises.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  All exercises have been added to the routine.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{exercise.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {exercise.category}
                          </Badge>
                          <Badge
                            variant={
                              exercise.difficulty === "beginner"
                                ? "success"
                                : exercise.difficulty === "intermediate"
                                ? "warning"
                                : "error"
                            }
                            className="text-xs"
                          >
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>
                            {Math.floor(exercise.duration / 60)}m{" "}
                            {exercise.duration % 60}s
                          </span>
                          {exercise.repetitions && (
                            <span>
                              {exercise.repetitions} reps × {exercise.sets} sets
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddExercise(exercise.id)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
        <Button
          onClick={handleSaveRoutine}
          size="lg"
          className="flex-1 gap-2"
          disabled={!routineName.trim() || selectedExercises.length === 0}
        >
          <Save className="h-5 w-5" />
          Save Routine
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/dashboard/exercises")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
