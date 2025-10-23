"use client";

import { useState } from "react";
import { useUserStore } from "@/stores";
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
  User,
  Heart,
  Bell,
  Dumbbell,
  Utensils,
  Save,
  X,
  Plus,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser, updateMedicalProfile, updatePreferences } =
    useUserStore();

  // Personal Info State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : ""
  );

  // Medical Profile State
  const [conditions, setConditions] = useState<string[]>(
    user?.medicalProfile?.conditions || []
  );
  const [newCondition, setNewCondition] = useState("");
  const [sittingTolerance, setSittingTolerance] = useState(
    user?.medicalProfile?.sittingTolerance || 15
  );
  const [chronicPainAreas, setChronicPainAreas] = useState<string[]>(
    user?.medicalProfile?.chronicPainAreas || []
  );
  const [newPainArea, setNewPainArea] = useState("");
  const [height, setHeight] = useState(user?.medicalProfile?.height || 0);
  const [weight, setWeight] = useState(user?.medicalProfile?.weight || 0);
  const [primaryDoctor, setPrimaryDoctor] = useState(
    user?.medicalProfile?.primaryDoctor || ""
  );
  const [physiotherapist, setPhysiotherapist] = useState(
    user?.medicalProfile?.physiotherapist || ""
  );

  // Preferences State
  const [theme, setTheme] = useState(user?.preferences?.theme || "system");
  const [exerciseReminders, setExerciseReminders] = useState(
    user?.preferences?.notifications?.exerciseReminders ?? true
  );
  const [painLogReminders, setPainLogReminders] = useState(
    user?.preferences?.notifications?.painLogReminders ?? true
  );
  const [medicationReminders, setMedicationReminders] = useState(
    user?.preferences?.notifications?.medicationReminders ?? true
  );
  const [reminderTime, setReminderTime] = useState(
    user?.preferences?.notifications?.reminderTime || "09:00"
  );
  const [naturopathicDiet, setNaturopathicDiet] = useState(
    user?.preferences?.dietPreferences?.naturopathicDiet ?? true
  );
  const [waterIntakeGoal, setWaterIntakeGoal] = useState(
    user?.preferences?.dietPreferences?.waterIntakeGoal || 8
  );

  const [activeTab, setActiveTab] = useState<
    "profile" | "medical" | "preferences"
  >("profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddPainArea = () => {
    if (newPainArea.trim()) {
      setChronicPainAreas([...chronicPainAreas, newPainArea.trim()]);
      setNewPainArea("");
    }
  };

  const handleRemovePainArea = (index: number) => {
    setChronicPainAreas(chronicPainAreas.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Update personal info
    if (user) {
      updateUser({
        name,
        email,
        dateOfBirth: new Date(dateOfBirth),
      });

      // Update medical profile
      updateMedicalProfile({
        conditions,
        sittingTolerance,
        chronicPainAreas,
        height: height || undefined,
        weight: weight || undefined,
        primaryDoctor: primaryDoctor || undefined,
        physiotherapist: physiotherapist || undefined,
        contraindications: user.medicalProfile?.contraindications || [],
        allergies: user.medicalProfile?.allergies || [],
        medications: user.medicalProfile?.medications || [],
        painLevel: user.medicalProfile?.painLevel || 0,
        painTriggers: user.medicalProfile?.painTriggers || [],
        updatedAt: new Date(),
      });

      // Update preferences
      updatePreferences({
        theme: theme as "light" | "dark" | "system",
        notifications: {
          exerciseReminders,
          painLogReminders,
          medicationReminders,
          progressReports:
            user.preferences?.notifications?.progressReports ?? true,
          reminderTime,
        },
        dietPreferences: {
          naturopathicDiet,
          oilFree: user.preferences?.dietPreferences?.oilFree ?? true,
          saltFree: user.preferences?.dietPreferences?.saltFree ?? true,
          sugarFree: user.preferences?.dietPreferences?.sugarFree ?? true,
          mealReminders:
            user.preferences?.dietPreferences?.mealReminders ?? true,
          waterIntakeGoal,
        },
        exercisePreferences: user.preferences?.exercisePreferences || {
          difficulty: "beginner",
          sessionDuration: 30,
          preferredTime: "morning",
          categories: [],
        },
        units: user.preferences?.units || {
          distance: "km",
          weight: "kg",
          temperature: "celsius",
        },
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, medical information, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "profile"
              ? "border-b-2 border-primary-500 text-primary-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="inline h-4 w-4 mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab("medical")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "medical"
              ? "border-b-2 border-primary-500 text-primary-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className="inline h-4 w-4 mr-2" />
          Medical
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "preferences"
              ? "border-b-2 border-primary-500 text-primary-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="inline h-4 w-4 mr-2" />
          Preferences
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Medical Tab */}
      {activeTab === "medical" && (
        <div className="space-y-6">
          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Conditions</CardTitle>
              <CardDescription>
                Track your diagnosed conditions and concerns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add a condition (e.g., cervical lordosis)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddCondition();
                    }
                  }}
                />
                <Button onClick={handleAddCondition} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {condition}
                    <button
                      onClick={() => handleRemoveCondition(index)}
                      className="ml-2 hover:text-error"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Physical Limitations */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Limitations</CardTitle>
              <CardDescription>
                Track your physical tolerances and limitations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sitting">Sitting Tolerance (minutes)</Label>
                <Input
                  id="sitting"
                  type="number"
                  min="0"
                  value={sittingTolerance}
                  onChange={(e) =>
                    setSittingTolerance(parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Chronic Pain Areas</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPainArea}
                    onChange={(e) => setNewPainArea(e.target.value)}
                    placeholder="Add pain area (e.g., lower back)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddPainArea();
                      }
                    }}
                  />
                  <Button onClick={handleAddPainArea} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {chronicPainAreas.map((area, index) => (
                    <Badge key={index} variant="error" className="text-sm">
                      {area}
                      <button
                        onClick={() => handleRemovePainArea(index)}
                        className="ml-2 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Metrics</CardTitle>
              <CardDescription>Track your height and weight</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="0"
                  value={height || ""}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                  placeholder="175"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  value={weight || ""}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                  placeholder="70"
                />
              </div>
            </CardContent>
          </Card>

          {/* Healthcare Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Providers</CardTitle>
              <CardDescription>Keep track of your medical team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Primary Doctor</Label>
                <Input
                  id="doctor"
                  value={primaryDoctor}
                  onChange={(e) => setPrimaryDoctor(e.target.value)}
                  placeholder="Dr. Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="physio">Physiotherapist</Label>
                <Input
                  id="physio"
                  value={physiotherapist}
                  onChange={(e) => setPhysiotherapist(e.target.value)}
                  placeholder="Jane Doe, PT"
                />
              </div>
            </CardContent>
          </Card>

          {/* Safety Notice */}
          <Card className="border-warning/50 bg-warning-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Medical Disclaimer</p>
                  <p className="text-sm text-warning-800">
                    This information is for tracking purposes only. Always
                    consult with qualified healthcare professionals for medical
                    advice, diagnosis, and treatment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exercise Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about scheduled exercises
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={exerciseReminders}
                  onChange={(e) => setExerciseReminders(e.target.checked)}
                  className="h-5 w-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Pain Log Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily reminders to log your pain levels
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={painLogReminders}
                  onChange={(e) => setPainLogReminders(e.target.checked)}
                  className="h-5 w-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Medication Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders to take your medications
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={medicationReminders}
                  onChange={(e) => setMedicationReminders(e.target.checked)}
                  className="h-5 w-5"
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="reminder-time">Default Reminder Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Diet Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Diet Preferences
              </CardTitle>
              <CardDescription>
                Dr. Manthena Satyanarayana Raju naturopathic principles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Naturopathic Diet</Label>
                  <p className="text-sm text-muted-foreground">
                    Follow natural healing principles
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={naturopathicDiet}
                  onChange={(e) => setNaturopathicDiet(e.target.checked)}
                  className="h-5 w-5"
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="water-goal">
                  Daily Water Intake Goal (glasses)
                </Label>
                <Input
                  id="water-goal"
                  type="number"
                  min="1"
                  max="20"
                  value={waterIntakeGoal}
                  onChange={(e) =>
                    setWaterIntakeGoal(parseInt(e.target.value) || 8)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex-1"
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
        <Button
          onClick={handleSave}
          size="lg"
          className="w-full gap-2"
          disabled={isSaving}
        >
          <Save className="h-5 w-5" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
