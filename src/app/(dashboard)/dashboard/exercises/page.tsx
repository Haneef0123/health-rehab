"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useExerciseStore } from "@/stores";
import {
  Play,
  Clock,
  Target,
  AlertTriangle,
  Search,
  Filter,
  Plus,
} from "lucide-react";

// Mock exercise data - will be replaced with actual data from store/API
const MOCK_EXERCISES = [
  {
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
  },
  {
    id: "2",
    name: "Wall Angels",
    description:
      "Shoulder blade retraction exercise to improve upper back posture",
    category: "mobility" as const,
    difficulty: "beginner" as const,
    duration: 240,
    repetitions: 12,
    sets: 3,
    targetAreas: ["upper back", "shoulders"],
    contraindications: ["shoulder impingement", "rotator cuff injury"],
    warnings: [
      "Keep lower back against wall",
      "Move slowly through full range",
    ],
    benefits: [
      "Opens chest",
      "Strengthens upper back",
      "Improves shoulder mobility",
    ],
  },
  {
    id: "3",
    name: "Cat-Cow Stretch",
    description: "Gentle spinal mobility exercise for entire spine",
    category: "stretching" as const,
    difficulty: "beginner" as const,
    duration: 120,
    repetitions: 10,
    sets: 2,
    targetAreas: ["entire spine", "lower back"],
    contraindications: ["acute back spasms"],
    warnings: [
      "Avoid if experiencing severe pain",
      "Move within comfortable range",
    ],
    benefits: [
      "Increases spinal flexibility",
      "Relieves back tension",
      "Improves posture",
    ],
  },
  {
    id: "4",
    name: "Doorway Chest Stretch",
    description:
      "Stretches chest muscles to counteract forward shoulder posture",
    category: "stretching" as const,
    difficulty: "beginner" as const,
    duration: 180,
    targetAreas: ["chest", "shoulders"],
    contraindications: ["shoulder dislocation history"],
    warnings: ["Don't overstretch", "Hold steady position"],
    benefits: ["Opens chest", "Improves posture", "Reduces shoulder tension"],
  },
  {
    id: "5",
    name: "Prone Cobra",
    description: "Strengthening exercise for upper and mid-back muscles",
    category: "strengthening" as const,
    difficulty: "intermediate" as const,
    duration: 90,
    repetitions: 8,
    sets: 3,
    targetAreas: ["upper back", "mid back"],
    contraindications: ["acute back pain", "disc herniation"],
    warnings: ["Start with short holds", "Keep neck neutral"],
    benefits: [
      "Strengthens back extensors",
      "Improves posture",
      "Increases back endurance",
    ],
  },
];

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const { activeSession, startSession } = useExerciseStore();

  const categories = [
    "stretching",
    "strengthening",
    "mobility",
    "posture",
    "breathing",
  ];
  const difficulties = ["beginner", "intermediate", "advanced"];

  const filteredExercises = MOCK_EXERCISES.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || exercise.category === selectedCategory;
    const matchesDifficulty =
      !selectedDifficulty || exercise.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercises</h1>
          <p className="mt-1 text-gray-600">
            Safe rehabilitation exercises for cervical spine recovery
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() =>
            (window.location.href = "/dashboard/exercises/routines")
          }
        >
          <Plus className="h-4 w-4" />
          Create Routine
        </Button>
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <Card className="border-l-4 border-l-primary-500 bg-primary-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500">
                <Play className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Session in Progress
                </h3>
                <p className="text-sm text-gray-600">
                  Continue your active workout
                </p>
              </div>
            </div>
            <Button variant="default">Continue Session</Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Category:</span>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Difficulty:
            </span>
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={
                  selectedDifficulty === difficulty ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setSelectedDifficulty(
                    selectedDifficulty === difficulty ? null : difficulty
                  )
                }
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="group transition-all hover:shadow-lg"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {exercise.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={getDifficultyColor(exercise.difficulty) as any}
                  className="ml-2 flex-shrink-0"
                >
                  {exercise.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {exercise.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.floor(exercise.duration / 60)}m{" "}
                      {exercise.duration % 60}s
                    </span>
                  </div>
                )}
                {exercise.repetitions && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{exercise.repetitions} reps</span>
                  </div>
                )}
                {exercise.sets && <span>× {exercise.sets} sets</span>}
              </div>

              {/* Target Areas */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700">
                  Target Areas:
                </p>
                <div className="flex flex-wrap gap-1">
                  {exercise.targetAreas.map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {exercise.contraindications.length > 0 && (
                <div className="rounded-lg bg-warning-50 p-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-warning-600" />
                    <p className="text-xs text-warning-800">
                      Not for: {exercise.contraindications.join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    window.location.href = `/dashboard/exercises/${exercise.id}`;
                  }}
                >
                  <Play className="h-4 w-4" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = `/dashboard/exercises/${exercise.id}`;
                  }}
                >
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No exercises found
            </h3>
            <p className="text-sm text-gray-600">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
