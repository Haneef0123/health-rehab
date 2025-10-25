"use client";

import { useState, useEffect } from "react";
import { useUserStore, useDietStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAlertDialog } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import type { Food } from "@/types/diet";
import {
  USER_ID_FALLBACK,
  MEAL_TYPES,
  FOOD_CATEGORIES,
  FOOD_UNITS,
  PREPARATION_METHODS,
  DEFAULT_WATER_GLASS_ML,
} from "@/lib/constants";
import {
  isNaturopathicFood,
  isRawPreparation,
  validateMealTime,
  validateNonEmpty,
  validateNonEmptyArray,
} from "@/lib/validation";
import {
  Plus,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Utensils,
  TrendingUp,
  Info,
  X,
  Loader2,
} from "lucide-react";

export default function DietPage() {
  const { user } = useUserStore();
  const {
    meals,
    waterLogs,
    addMeal,
    addWaterIntake,
    deleteMeal,
    updateMeal,
    fetchMeals,
    fetchWaterLogs,
    _isHydrated,
    isLoading: storeLoading,
  } = useDietStore();
  const { showAlert, AlertDialog } = useAlertDialog();
  const today = new Date().toISOString().split("T")[0];

  // State
  const [selectedDate, setSelectedDate] = useState(today);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newFood, setNewFood] = useState("");
  const [isAddingWater, setIsAddingWater] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  // New meal form
  const [mealType, setMealType] =
    useState<(typeof MEAL_TYPES)[number]>("breakfast");
  const [mealName, setMealName] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealFoods, setMealFoods] = useState<Food[]>([]);
  const [mealNotes, setMealNotes] = useState("");

  // New food form fields
  const [foodCategory, setFoodCategory] =
    useState<(typeof FOOD_CATEGORIES)[number]>("fruit");
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [foodUnit, setFoodUnit] =
    useState<(typeof FOOD_UNITS)[number]>("piece");
  const [foodPreparation, setFoodPreparation] =
    useState<(typeof PREPARATION_METHODS)[number]>("raw");

  // Reload data when date changes or when store hydrates
  useEffect(() => {
    // Wait for store to hydrate
    if (!_isHydrated) {
      return;
    }

    const loadData = async () => {
      try {
        const date = new Date(selectedDate);
        // Fetch fresh data for the selected date
        await Promise.all([fetchMeals(date), fetchWaterLogs(date, date)]);
      } catch (error) {
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load data. Please try again.",
        });
      }
    };
    loadData();
  }, [selectedDate, _isHydrated, fetchMeals, fetchWaterLogs]);

  // Get today's water log
  const todayWaterLog = waterLogs.find((log) => {
    const logDate = new Date(log.date);
    const targetDate = new Date(selectedDate);
    logDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === targetDate.getTime();
  });

  const waterGlasses = todayWaterLog?.glasses || 0;

  // Filter meals for selected date only
  const dayMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.date);
    const targetDate = new Date(selectedDate);
    mealDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    return mealDate.getTime() === targetDate.getTime();
  });

  // Water intake goal from user preferences
  const waterGoal = user?.preferences.dietPreferences.waterIntakeGoal || 10;
  const naturopathicDiet =
    user?.preferences.dietPreferences.naturopathicDiet || false;

  // Calculate compliance score for selected day only
  const calculateComplianceScore = () => {
    if (dayMeals.length === 0) return 0;

    let totalScore = 0;
    dayMeals.forEach((meal) => {
      let mealScore = 0;
      // Check if foods are prepared properly
      const hasRawFoods = meal.foods.some(
        (f) => f.preparation && isRawPreparation(f.preparation)
      );
      const allNaturopathic = meal.foods.every((f) =>
        isNaturopathicFood(f.category)
      );

      if (allNaturopathic) mealScore += 50;
      if (hasRawFoods) mealScore += 50;

      totalScore += mealScore;
    });

    return Math.round(totalScore / dayMeals.length);
  };

  // Add water glass (250ml per glass)
  const handleAddWaterGlass = async () => {
    if (isAddingWater) return;

    setIsAddingWater(true);
    try {
      const date = new Date(selectedDate);
      await addWaterIntake(DEFAULT_WATER_GLASS_ML, date);
      toast({
        variant: "success",
        title: "Water Added",
        description: `Added ${DEFAULT_WATER_GLASS_ML}ml to your intake`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to add water intake. Please try again.",
      });
    } finally {
      setIsAddingWater(false);
    }
  };

  // Add food to meal form
  const handleAddFood = () => {
    const nameValidation = validateNonEmpty(newFood, "Food name");
    if (!nameValidation.valid) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: nameValidation.error,
      });
      return;
    }

    if (foodQuantity <= 0) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Quantity must be greater than 0",
      });
      return;
    }

    const food: Food = {
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newFood.trim(),
      category: foodCategory,
      quantity: foodQuantity,
      unit: foodUnit,
      preparation: foodPreparation,
    };

    setMealFoods([...mealFoods, food]);
    setNewFood("");
    // Reset to defaults
    setFoodCategory("fruit");
    setFoodQuantity(1);
    setFoodUnit("piece");
    setFoodPreparation("raw");
  };

  // Remove food from meal form
  const handleRemoveFood = (foodId: string) => {
    setMealFoods(mealFoods.filter((f) => f.id !== foodId));
  };

  // Add meal
  const handleAddMeal = async () => {
    // Validation
    const nameValidation = validateNonEmpty(mealName, "Meal name");
    if (!nameValidation.valid) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: nameValidation.error,
      });
      return;
    }

    const timeValidation = validateMealTime(mealTime);
    if (!timeValidation.valid) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: timeValidation.error,
      });
      return;
    }

    const foodsValidation = validateNonEmptyArray(mealFoods, "Foods");
    if (!foodsValidation.valid) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: foodsValidation.error,
      });
      return;
    }

    if (isAddingMeal) return;

    setIsAddingMeal(true);
    try {
      const date = new Date(selectedDate);
      const mealData = {
        entryType: "meal" as const,
        userId: user?.id ?? USER_ID_FALLBACK,
        name: mealName.trim(),
        type: mealType,
        scheduledTime: mealTime,
        foods: mealFoods,
        nutrition: {},
        consumed: true,
        consumedAt: new Date(),
        notes: mealNotes,
        date: date,
      };

      if (editingMealId) {
        await updateMeal(editingMealId, mealData);
        toast({
          variant: "success",
          title: "Meal Updated",
          description: "Your meal has been updated successfully",
        });
      } else {
        await addMeal(mealData);
        toast({
          variant: "success",
          title: "Meal Added",
          description: "Your meal has been logged successfully",
        });
      }

      // Reset form
      setMealFoods([]);
      setMealName("");
      setMealTime("");
      setMealNotes("");
      setShowAddMeal(false);
      setEditingMealId(null);
      // Note: No need to refetch - store updates state internally
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to ${
          editingMealId ? "update" : "add"
        } meal. Please try again.`,
      });
    } finally {
      setIsAddingMeal(false);
    }
  };

  // Edit meal
  const handleEditMeal = (meal: (typeof dayMeals)[0]) => {
    setEditingMealId(meal.id);
    setMealName(meal.name);
    setMealType(meal.type);
    setMealTime(meal.scheduledTime);
    setMealFoods([...meal.foods]);
    setMealNotes(meal.notes || "");
    setShowAddMeal(true);
  };

  // Delete meal
  const handleDeleteMeal = async (mealId: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      showAlert({
        title: "Delete Meal",
        description:
          "Are you sure you want to delete this meal? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!confirmed) return;

    try {
      await deleteMeal(mealId);
      toast({
        variant: "success",
        title: "Meal Deleted",
        description: "The meal has been removed successfully",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to delete meal. Please try again.",
      });
    }
  };

  // Cancel meal form
  const handleCancelMealForm = () => {
    setShowAddMeal(false);
    setEditingMealId(null);
    setMealName("");
    setMealTime("");
    setMealFoods([]);
    setMealNotes("");
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
                <p className="text-2xl font-bold">{dayMeals.length}</p>
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
            {naturopathicDiet && dayMeals.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">
                  Dr. Manthena Principles Adherence
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      meals.every((m) =>
                        m.foods.every((f) =>
                          ["fruit", "vegetable", "nut", "seed"].includes(
                            f.category
                          )
                        )
                      )
                        ? "success"
                        : "default"
                    }
                  >
                    {meals.every((m) =>
                      m.foods.every((f) =>
                        ["fruit", "vegetable", "nut", "seed"].includes(
                          f.category
                        )
                      )
                    )
                      ? "✓"
                      : "○"}{" "}
                    Naturopathic Foods
                  </Badge>
                  <Badge
                    variant={
                      meals.some((m) =>
                        m.foods.some((f) => f.preparation === "raw")
                      )
                        ? "success"
                        : "default"
                    }
                  >
                    {meals.some((m) =>
                      m.foods.some((f) => f.preparation === "raw")
                    )
                      ? "✓"
                      : "○"}{" "}
                    Raw Foods Included
                  </Badge>
                  <Badge variant="default">
                    {dayMeals.length} Meals Logged
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

                  {/* Meal Name */}
                  <div>
                    <Label htmlFor="meal-name">Meal Name</Label>
                    <Input
                      id="meal-name"
                      placeholder="e.g., Fruit Salad"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                    />
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

                    {/* Food input form */}
                    <div className="space-y-3 mt-2 p-3 bg-muted/50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Food Name</Label>
                          <Input
                            placeholder="e.g., Apple"
                            value={newFood}
                            onChange={(e) => setNewFood(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddFood();
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Category</Label>
                          <select
                            value={foodCategory}
                            onChange={(e) =>
                              setFoodCategory(e.target.value as any)
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {FOOD_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() +
                                  cat.slice(1).replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={foodQuantity}
                            onChange={(e) =>
                              setFoodQuantity(parseFloat(e.target.value))
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unit</Label>
                          <select
                            value={foodUnit}
                            onChange={(e) => setFoodUnit(e.target.value as any)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {FOOD_UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Preparation</Label>
                          <select
                            value={foodPreparation}
                            onChange={(e) =>
                              setFoodPreparation(e.target.value as any)
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {PREPARATION_METHODS.map((prep) => (
                              <option key={prep} value={prep}>
                                {prep.charAt(0).toUpperCase() + prep.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAddFood}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Food
                      </Button>
                    </div>

                    {/* Added foods list */}
                    {mealFoods.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {mealFoods.map((food) => (
                          <Badge
                            key={food.id}
                            variant="default"
                            className="text-xs"
                          >
                            {food.name} ({food.quantity} {food.unit},{" "}
                            {food.preparation})
                            <button
                              type="button"
                              onClick={() => handleRemoveFood(food.id)}
                              className="cursor-pointer ml-2 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

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
                    <Button onClick={handleAddMeal} disabled={isAddingMeal}>
                      {isAddingMeal && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingMealId ? "Update Meal" : "Add Meal"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelMealForm}
                      disabled={isAddingMeal}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Meals list */}
            {storeLoading || !_isHydrated ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading meals...</p>
              </div>
            ) : dayMeals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No meals logged for this day</p>
                <p className="text-sm mt-2">
                  Click &quot;Log Meal&quot; to add your first meal
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dayMeals
                  .sort((a, b) =>
                    a.scheduledTime.localeCompare(b.scheduledTime)
                  )
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
                            {meal.scheduledTime}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMeal(meal)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <p className="text-sm font-semibold mb-1">
                          {meal.name}
                        </p>
                        <p className="text-sm font-medium mb-1">Foods:</p>
                        <div className="flex flex-wrap gap-1">
                          {meal.foods.map((food) => (
                            <Badge key={food.id} variant="secondary">
                              {food.name} ({food.quantity} {food.unit})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {meal.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Notes:</strong> {meal.notes}
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

            <Button
              onClick={handleAddWaterGlass}
              className="w-full mb-4"
              disabled={isAddingWater}
            >
              {isAddingWater ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Glass (250ml)
            </Button>

            {/* Water log */}
            {todayWaterLog &&
              todayWaterLog.entries &&
              todayWaterLog.entries.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Today&apos;s Log:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {todayWaterLog.entries.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm text-muted-foreground"
                      >
                        <span>
                          {new Date(entry.time).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>
                          +{Math.round(entry.amount / 250)} glass (
                          {entry.amount}ml)
                        </span>
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

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
