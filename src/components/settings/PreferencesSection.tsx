import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Utensils } from "lucide-react";

interface PreferencesSectionProps {
  theme: string;
  exerciseReminders: boolean;
  painLogReminders: boolean;
  medicationReminders: boolean;
  reminderTime: string;
  naturopathicDiet: boolean;
  waterIntakeGoal: number;
  onThemeChange: (value: string) => void;
  onExerciseRemindersChange: (value: boolean) => void;
  onPainLogRemindersChange: (value: boolean) => void;
  onMedicationRemindersChange: (value: boolean) => void;
  onReminderTimeChange: (value: string) => void;
  onNaturopathicDietChange: (value: boolean) => void;
  onWaterIntakeGoalChange: (value: number) => void;
}

export function PreferencesSection({
  theme,
  exerciseReminders,
  painLogReminders,
  medicationReminders,
  reminderTime,
  naturopathicDiet,
  waterIntakeGoal,
  onThemeChange,
  onExerciseRemindersChange,
  onPainLogRemindersChange,
  onMedicationRemindersChange,
  onReminderTimeChange,
  onNaturopathicDietChange,
  onWaterIntakeGoalChange,
}: PreferencesSectionProps) {
  return (
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
              onChange={(e) => onExerciseRemindersChange(e.target.checked)}
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
              onChange={(e) => onPainLogRemindersChange(e.target.checked)}
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
              onChange={(e) => onMedicationRemindersChange(e.target.checked)}
              className="h-5 w-5"
            />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="reminder-time">Default Reminder Time</Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => onReminderTimeChange(e.target.value)}
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
              onChange={(e) => onNaturopathicDietChange(e.target.checked)}
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
                onWaterIntakeGoalChange(parseInt(e.target.value) || 8)
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
                onClick={() => onThemeChange("light")}
                className="flex-1"
              >
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => onThemeChange("dark")}
                className="flex-1"
              >
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => onThemeChange("system")}
                className="flex-1"
              >
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
