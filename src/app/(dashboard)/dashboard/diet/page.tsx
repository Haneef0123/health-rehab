"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Utensils,
  TrendingUp,
  Calendar,
  Info,
} from "lucide-react";

interface MealEntry {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  time: string;
  foods: string[];
  compliance: {
    oilFree: boolean;
    saltFree: boolean;
    sugarFree: boolean;
    raw: boolean;
  };
  notes: string;
  consumed: boolean;
}

interface WaterEntry {
  time: string;
  glasses: number;
}

export default function DietPage() {
  const { user } = useUserStore();
  const today = new Date().toISOString().split("T")[0];

  // State
  const [selectedDate, setSelectedDate] = useState(today);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newFood, setNewFood] = useState("");

  // New meal form
  const [mealType, setMealType] = useState<MealEntry["type"]>("breakfast");
  const [mealTime, setMealTime] = useState("");
  const [mealFoods, setMealFoods] = useState<string[]>([]);
  const [mealCompliance, setMealCompliance] = useState({
    oilFree: true,
    saltFree: true,
    sugarFree: true,
    raw: false,
  });
  const [mealNotes, setMealNotes] = useState("");

  // Water intake goal from user preferences
  const waterGoal = user?.preferences.dietPreferences.waterIntakeGoal || 10;
  const naturopathicDiet =
    user?.preferences.dietPreferences.naturopathicDiet || false;

  // Calculate compliance score
  const calculateComplianceScore = () => {
    if (meals.length === 0) return 0;

    let totalScore = 0;
    meals.forEach((meal) => {
      let mealScore = 0;
      if (meal.compliance.oilFree) mealScore += 25;
      if (meal.compliance.saltFree) mealScore += 25;
      if (meal.compliance.sugarFree) mealScore += 25;
      if (meal.compliance.raw) mealScore += 25;
      totalScore += mealScore;
    });

    return Math.round(totalScore / meals.length);
  };

  // Add water glass
  const addWaterGlass = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setWaterGlasses((prev) => prev + 1);
    setWaterEntries((prev) => [...prev, { time, glasses: 1 }]);
  };

  // Add meal
  const addMeal = () => {
    if (mealFoods.length === 0 || !mealTime) {
      alert("Please add at least one food item and set a time");
      return;
    }

    const newMeal: MealEntry = {
      id: Date.now().toString(),
      type: mealType,
      time: mealTime,
      foods: mealFoods,
      compliance: mealCompliance,
      notes: mealNotes,
      consumed: true,
    };

    setMeals((prev) => [...prev, newMeal]);
    // Reset form
    setMealFoods([]);
    setMealTime("");
    setMealNotes("");
    setMealCompliance({
      oilFree: true,
      saltFree: true,
      sugarFree: true,
      raw: false,
    });
    setShowAddMeal(false);
  };

  // Add food to meal
  const addFoodToMeal = () => {
    if (newFood.trim()) {
      setMealFoods((prev) => [...prev, newFood.trim()]);
      setNewFood("");
    }
  };

  // Remove food from meal
  const removeFoodFromMeal = (index: number) => {
    setMealFoods((prev) => prev.filter((_, i) => i !== index));
  };

  // Delete meal
  const deleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const complianceScore = calculateComplianceScore();
  const waterProgress = (waterGlasses / waterGoal) * 100;

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Diet Tracking</h1>
        <p className="text-muted-foreground">
          Log your meals and track compliance with Dr. Manthena&apos;s
          naturopathic diet principles
        </p>
      </div>

      {/* Date selector */}
      <div className="mb-6">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={today}
          className="max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily summary */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Daily Summary</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Meals Logged
                </p>
                <p className="text-2xl font-bold">{meals.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Compliance Score
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{complianceScore}%</p>
                  {complianceScore >= 80 && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  {complianceScore < 80 && complianceScore > 0 && (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  )}
                </div>
              </div>
            </div>

            {/* Principles summary */}
            {naturopathicDiet && meals.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">
                  Dr. Manthena Principles Adherence
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      meals.every((m) => m.compliance.oilFree)
                        ? "success"
                        : "error"
                    }
                  >
                    {meals.every((m) => m.compliance.oilFree) ? "✓" : "✗"}{" "}
                    Oil-Free
                  </Badge>
                  <Badge
                    variant={
                      meals.every((m) => m.compliance.saltFree)
                        ? "success"
                        : "error"
                    }
                  >
                    {meals.every((m) => m.compliance.saltFree) ? "✓" : "✗"}{" "}
                    Salt-Free
                  </Badge>
                  <Badge
                    variant={
                      meals.every((m) => m.compliance.sugarFree)
                        ? "success"
                        : "error"
                    }
                  >
                    {meals.every((m) => m.compliance.sugarFree) ? "✓" : "✗"}{" "}
                    Sugar-Free
                  </Badge>
                  <Badge
                    variant={
                      meals.some((m) => m.compliance.raw)
                        ? "success"
                        : "default"
                    }
                  >
                    {meals.some((m) => m.compliance.raw) ? "✓" : "○"} Raw Foods
                    Included
                  </Badge>
                </div>
              </div>
            )}
          </Card>

          {/* Meals list */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Meals</h2>
              </div>
              <Button onClick={() => setShowAddMeal(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Log Meal
              </Button>
            </div>

            {/* Add meal form */}
            {showAddMeal && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-4">Add New Meal</h3>

                <div className="space-y-4">
                  {/* Meal type */}
                  <div>
                    <Label>Meal Type</Label>
                    <div className="flex gap-2 mt-2">
                      {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                        (type) => (
                          <Button
                            key={type}
                            type="button"
                            variant={mealType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMealType(type)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <Label htmlFor="meal-time">Time</Label>
                    <Input
                      id="meal-time"
                      type="time"
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                    />
                  </div>

                  {/* Foods */}
                  <div>
                    <Label>Foods</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Enter food item"
                        value={newFood}
                        onChange={(e) => setNewFood(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFoodToMeal();
                          }
                        }}
                      />
                      <Button type="button" onClick={addFoodToMeal} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {mealFoods.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {mealFoods.map((food, index) => (
                          <Badge key={index} variant="default">
                            {food}
                            <button
                              type="button"
                              onClick={() => removeFoodFromMeal(index)}
                              className="ml-2 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Compliance checkboxes */}
                  {naturopathicDiet && (
                    <div>
                      <Label>Dr. Manthena Principles</Label>
                      <div className="space-y-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={mealCompliance.oilFree}
                            onChange={(e) =>
                              setMealCompliance({
                                ...mealCompliance,
                                oilFree: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm">Oil-Free</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={mealCompliance.saltFree}
                            onChange={(e) =>
                              setMealCompliance({
                                ...mealCompliance,
                                saltFree: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm">Salt-Free</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={mealCompliance.sugarFree}
                            onChange={(e) =>
                              setMealCompliance({
                                ...mealCompliance,
                                sugarFree: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm">Sugar-Free</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={mealCompliance.raw}
                            onChange={(e) =>
                              setMealCompliance({
                                ...mealCompliance,
                                raw: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm">Contains Raw Foods</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Label htmlFor="meal-notes">Notes (optional)</Label>
                    <Input
                      id="meal-notes"
                      placeholder="e.g., Felt energized after eating"
                      value={mealNotes}
                      onChange={(e) => setMealNotes(e.target.value)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button onClick={addMeal}>Add Meal</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddMeal(false);
                        setMealFoods([]);
                        setMealTime("");
                        setMealNotes("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Meals list */}
            {meals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No meals logged for this day</p>
                <p className="text-sm mt-2">
                  Click &quot;Log Meal&quot; to add your first meal
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meals
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((meal) => (
                    <div key={meal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            {meal.type.charAt(0).toUpperCase() +
                              meal.type.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meal.time}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMeal(meal.id)}
                        >
                          Delete
                        </Button>
                      </div>

                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">Foods:</p>
                        <div className="flex flex-wrap gap-1">
                          {meal.foods.map((food, index) => (
                            <Badge key={index} variant="secondary">
                              {food}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {naturopathicDiet && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {meal.compliance.oilFree && (
                            <Badge variant="success" className="text-xs">
                              Oil-Free
                            </Badge>
                          )}
                          {meal.compliance.saltFree && (
                            <Badge variant="success" className="text-xs">
                              Salt-Free
                            </Badge>
                          )}
                          {meal.compliance.sugarFree && (
                            <Badge variant="success" className="text-xs">
                              Sugar-Free
                            </Badge>
                          )}
                          {meal.compliance.raw && (
                            <Badge variant="success" className="text-xs">
                              Raw
                            </Badge>
                          )}
                        </div>
                      )}

                      {meal.notes && (
                        <p className="text-sm text-muted-foreground">
                          {meal.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Water intake */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Water Intake</h2>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-3xl font-bold">{waterGlasses}</p>
                <p className="text-sm text-muted-foreground">
                  of {waterGoal} glasses
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all rounded-full"
                  style={{ width: `${Math.min(waterProgress, 100)}%` }}
                />
              </div>

              {waterGlasses >= waterGoal && (
                <div className="flex items-center gap-2 mt-2 text-sm text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Goal achieved!
                </div>
              )}
            </div>

            <Button onClick={addWaterGlass} className="w-full mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Glass
            </Button>

            {/* Water log */}
            {waterEntries.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Today&apos;s Log:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {waterEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm text-muted-foreground"
                    >
                      <span>{entry.time}</span>
                      <span>+{entry.glasses} glass</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Dr. Manthena principles card */}
          {naturopathicDiet && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5" />
                <h3 className="font-semibold">Dr. Manthena Principles</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p>Completely oil-free cooking</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p>No added salt or minimal use</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p>No refined sugars</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p>Include raw vegetables and fruits</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p>Drink adequate water (8-10 glasses)</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p>Early dinner (before 7 PM)</p>
                </div>
              </div>
            </Card>
          )}

          {/* Medical disclaimer */}
          <Card className="p-6 border-warning bg-warning/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold">Medical Disclaimer</p>
                <p className="text-xs text-muted-foreground">
                  This diet tracker is for informational purposes only. Always
                  consult with a qualified naturopathic doctor or healthcare
                  provider before making significant dietary changes, especially
                  if you have existing medical conditions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
