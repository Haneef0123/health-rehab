"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { MedicalSection } from "@/components/settings/MedicalSection";
import { PreferencesSection } from "@/components/settings/PreferencesSection";
import { BackupSection } from "@/components/settings/BackupSection";
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
import { useAlertDialog } from "@/components/ui/alert-dialog";
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
  Database,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { exportAllData, importData, clearAllData } from "@/lib/db";

export default function SettingsPage() {
  const { showAlert, AlertDialog } = useAlertDialog();
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
    "profile" | "medical" | "preferences" | "backup"
  >("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Backup state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  // Track changes for dirty state
  useEffect(() => {
    if (!user) {
      setIsDirty(false);
      return;
    }

    const hasProfileChanges =
      name !== (user.name || "") ||
      email !== (user.email || "") ||
      dateOfBirth !==
        (user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "");

    const hasMedicalChanges =
      JSON.stringify(conditions) !==
        JSON.stringify(user.medicalProfile?.conditions || []) ||
      sittingTolerance !== (user.medicalProfile?.sittingTolerance || 15) ||
      JSON.stringify(chronicPainAreas) !==
        JSON.stringify(user.medicalProfile?.chronicPainAreas || []) ||
      height !== (user.medicalProfile?.height || 0) ||
      weight !== (user.medicalProfile?.weight || 0) ||
      primaryDoctor !== (user.medicalProfile?.primaryDoctor || "") ||
      physiotherapist !== (user.medicalProfile?.physiotherapist || "");

    const hasPreferenceChanges =
      theme !== (user.preferences?.theme || "system") ||
      exerciseReminders !==
        (user.preferences?.notifications?.exerciseReminders ?? true) ||
      painLogReminders !==
        (user.preferences?.notifications?.painLogReminders ?? true) ||
      medicationReminders !==
        (user.preferences?.notifications?.medicationReminders ?? true) ||
      reminderTime !==
        (user.preferences?.notifications?.reminderTime || "09:00") ||
      naturopathicDiet !==
        (user.preferences?.dietPreferences?.naturopathicDiet ?? true) ||
      waterIntakeGoal !==
        (user.preferences?.dietPreferences?.waterIntakeGoal || 8);

    setIsDirty(hasProfileChanges || hasMedicalChanges || hasPreferenceChanges);
  }, [
    user,
    name,
    email,
    dateOfBirth,
    conditions,
    sittingTolerance,
    chronicPainAreas,
    height,
    weight,
    primaryDoctor,
    physiotherapist,
    theme,
    exerciseReminders,
    painLogReminders,
    medicationReminders,
    reminderTime,
    naturopathicDiet,
    waterIntakeGoal,
  ]);

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
      showAlert({
        title: "Settings Saved",
        description: "Your settings have been saved successfully!",
        confirmText: "OK",
      });
    }, 500);
  };

  // Backup handlers
  const handleExportData = async () => {
    setIsExporting(true);
    setBackupSuccess(null);

    try {
      const data = await exportAllData();

      // Create downloadable JSON file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `health-rehab-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastBackupDate(new Date());
      setBackupSuccess("Data exported successfully!");

      setTimeout(() => setBackupSuccess(null), 3000);
    } catch (error) {
      console.error("Export failed:", error);
      showAlert({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        confirmText: "OK",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setBackupSuccess(null);

    try {
      const text = await file.text();
      const result = await importData(text);

      if (result.success) {
        setBackupSuccess(result.message);

        // Refresh after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showAlert({
          title: "Import Failed",
          description: result.message,
          confirmText: "OK",
        });
      }
    } catch (error) {
      console.error("Import failed:", error);
      showAlert({
        title: "Import Failed",
        description:
          "Failed to import data. Please ensure the file is valid JSON.",
        confirmText: "OK",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleClearAllData = async () => {
    showAlert({
      title: "⚠️ Delete All Data",
      description:
        "This will permanently delete ALL your data including pain logs, exercise sessions, diet entries, and medications. This action cannot be undone. Are you absolutely sure?",
      confirmText: "Yes, Delete Everything",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        setIsClearing(true);
        setBackupSuccess(null);

        try {
          await clearAllData();

          showAlert({
            title: "Data Cleared",
            description: "All data has been cleared. The page will now reload.",
            confirmText: "OK",
            onConfirm: () => {
              window.location.reload();
            },
          });
        } catch (error) {
          console.error("Clear data failed:", error);
          showAlert({
            title: "Clear Failed",
            description: "Failed to clear data. Please try again.",
            confirmText: "OK",
          });
        } finally {
          setIsClearing(false);
        }
      },
    });
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
          className={`cursor-pointer px-4 py-2 font-medium transition-colors ${
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
          className={`cursor-pointer px-4 py-2 font-medium transition-colors ${
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
          className={`cursor-pointer px-4 py-2 font-medium transition-colors ${
            activeTab === "preferences"
              ? "border-b-2 border-primary-500 text-primary-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="inline h-4 w-4 mr-2" />
          Preferences
        </button>
        <button
          onClick={() => setActiveTab("backup")}
          className={`cursor-pointer px-4 py-2 font-medium transition-colors ${
            activeTab === "backup"
              ? "border-b-2 border-primary-500 text-primary-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="inline h-4 w-4 mr-2" />
          Backup & Data
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <ProfileSection
          name={name}
          email={email}
          dateOfBirth={dateOfBirth}
          onNameChange={setName}
          onEmailChange={setEmail}
          onDateOfBirthChange={setDateOfBirth}
        />
      )}

      {/* Medical Tab */}
      {activeTab === "medical" && (
        <MedicalSection
          conditions={conditions}
          newCondition={newCondition}
          sittingTolerance={sittingTolerance}
          chronicPainAreas={chronicPainAreas}
          newPainArea={newPainArea}
          height={height}
          weight={weight}
          primaryDoctor={primaryDoctor}
          physiotherapist={physiotherapist}
          onNewConditionChange={setNewCondition}
          onAddCondition={handleAddCondition}
          onRemoveCondition={handleRemoveCondition}
          onSittingToleranceChange={setSittingTolerance}
          onNewPainAreaChange={setNewPainArea}
          onAddPainArea={handleAddPainArea}
          onRemovePainArea={handleRemovePainArea}
          onHeightChange={setHeight}
          onWeightChange={setWeight}
          onPrimaryDoctorChange={setPrimaryDoctor}
          onPhysiotherapistChange={setPhysiotherapist}
        />
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <PreferencesSection
          theme={theme}
          exerciseReminders={exerciseReminders}
          painLogReminders={painLogReminders}
          medicationReminders={medicationReminders}
          reminderTime={reminderTime}
          naturopathicDiet={naturopathicDiet}
          waterIntakeGoal={waterIntakeGoal}
          onThemeChange={(value) =>
            setTheme(value as "light" | "dark" | "system")
          }
          onExerciseRemindersChange={setExerciseReminders}
          onPainLogRemindersChange={setPainLogReminders}
          onMedicationRemindersChange={setMedicationReminders}
          onReminderTimeChange={setReminderTime}
          onNaturopathicDietChange={setNaturopathicDiet}
          onWaterIntakeGoalChange={setWaterIntakeGoal}
        />
      )}

      {/* Backup & Data Tab */}
      {activeTab === "backup" && (
        <BackupSection
          backupSuccess={backupSuccess}
          lastBackupDate={lastBackupDate}
          isExporting={isExporting}
          isImporting={isImporting}
          isClearing={isClearing}
          onExport={handleExportData}
          onImport={handleImportData}
          onClearAll={handleClearAllData}
        />
      )}

      {/* Save Button */}
      {activeTab !== "backup" && (
        <div className="sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full gap-2"
            disabled={!isDirty || isSaving}
          >
            <Save className="h-5 w-5" />
            {isSaving ? "Saving..." : isDirty ? "Save Changes" : "No Changes"}
          </Button>
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
