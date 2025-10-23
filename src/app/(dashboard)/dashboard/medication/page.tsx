"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Package,
  Calendar,
  Edit,
  Trash2,
  Info,
} from "lucide-react";

interface Medication {
  id: string;
  name: string;
  type: "prescription" | "supplement" | "ayurvedic" | "homeopathic" | "other";
  dosage: string;
  purpose: string;
  schedule: {
    frequency: string;
    times: string[];
    withMeal: boolean;
  };
  inventory: {
    current: number;
    unit: string;
    lowThreshold: number;
  };
  active: boolean;
  instructions?: string;
}

interface MedicationLog {
  medicationId: string;
  scheduledTime: string;
  status: "taken" | "skipped" | "missed" | "pending";
  actualTime?: string;
  notes?: string;
}

export default function MedicationPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [medName, setMedName] = useState("");
  const [medType, setMedType] = useState<Medication["type"]>("prescription");
  const [medDosage, setMedDosage] = useState("");
  const [medPurpose, setMedPurpose] = useState("");
  const [medFrequency, setMedFrequency] = useState("once");
  const [medTimes, setMedTimes] = useState<string[]>([""]);
  const [medWithMeal, setMedWithMeal] = useState(false);
  const [medInventory, setMedInventory] = useState("30");
  const [medUnit, setMedUnit] = useState("tablets");
  const [medLowThreshold, setMedLowThreshold] = useState("5");
  const [medInstructions, setMedInstructions] = useState("");

  // Add medication
  const addMedication = () => {
    if (!medName || !medDosage || !medPurpose) {
      alert("Please fill in all required fields");
      return;
    }

    const validTimes = medTimes.filter((t) => t !== "");
    if (validTimes.length === 0) {
      alert("Please add at least one time");
      return;
    }

    const newMed: Medication = {
      id: Date.now().toString(),
      name: medName,
      type: medType,
      dosage: medDosage,
      purpose: medPurpose,
      schedule: {
        frequency: medFrequency,
        times: validTimes,
        withMeal: medWithMeal,
      },
      inventory: {
        current: parseInt(medInventory),
        unit: medUnit,
        lowThreshold: parseInt(medLowThreshold),
      },
      active: true,
      instructions: medInstructions || undefined,
    };

    setMedications((prev) => [...prev, newMed]);

    // Reset form
    setMedName("");
    setMedDosage("");
    setMedPurpose("");
    setMedTimes([""]);
    setMedInventory("30");
    setMedInstructions("");
    setShowAddForm(false);
  };

  // Delete medication
  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // Toggle medication active status
  const toggleMedicationStatus = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  // Log medication intake
  const logIntake = (medicationId: string, scheduledTime: string) => {
    const now = new Date();
    const actualTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setTodayLogs((prev) => [
      ...prev.filter(
        (l) =>
          !(
            l.medicationId === medicationId && l.scheduledTime === scheduledTime
          )
      ),
      {
        medicationId,
        scheduledTime,
        status: "taken",
        actualTime,
      },
    ]);

    // Decrease inventory
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medicationId
          ? {
              ...m,
              inventory: {
                ...m.inventory,
                current: m.inventory.current - 1,
              },
            }
          : m
      )
    );
  };

  // Skip medication
  const skipIntake = (medicationId: string, scheduledTime: string) => {
    setTodayLogs((prev) => [
      ...prev.filter(
        (l) =>
          !(
            l.medicationId === medicationId && l.scheduledTime === scheduledTime
          )
      ),
      {
        medicationId,
        scheduledTime,
        status: "skipped",
      },
    ]);
  };

  // Check if medication is logged
  const getLogStatus = (medicationId: string, time: string) => {
    const log = todayLogs.find(
      (l) => l.medicationId === medicationId && l.scheduledTime === time
    );
    return log?.status || "pending";
  };

  // Get today's schedule
  const getTodaySchedule = () => {
    const schedule: Array<{
      medication: Medication;
      time: string;
      status: string;
    }> = [];

    medications
      .filter((m) => m.active)
      .forEach((med) => {
        med.schedule.times.forEach((time) => {
          schedule.push({
            medication: med,
            time,
            status: getLogStatus(med.id, time),
          });
        });
      });

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Calculate adherence rate
  const getAdherenceRate = () => {
    const totalScheduled = getTodaySchedule().length;
    if (totalScheduled === 0) return 0;

    const taken = todayLogs.filter((l) => l.status === "taken").length;
    return Math.round((taken / totalScheduled) * 100);
  };

  const todaySchedule = getTodaySchedule();
  const adherenceRate = getAdherenceRate();

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Medication Management</h1>
        <p className="text-muted-foreground">
          Track your medications, log intake, and manage reminders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's schedule */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Today&apos;s Schedule</h2>
              </div>
              <Badge variant={adherenceRate >= 80 ? "success" : "default"}>
                {adherenceRate}% adherence
              </Badge>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No medications scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div
                    key={`${item.medication.id}-${item.time}`}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="font-semibold">{item.time}</p>
                        {item.medication.schedule.withMeal && (
                          <p className="text-xs text-muted-foreground">
                            with meal
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="font-medium">{item.medication.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.medication.dosage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "taken" ? (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Taken
                        </Badge>
                      ) : item.status === "skipped" ? (
                        <Badge variant="secondary">Skipped</Badge>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              logIntake(item.medication.id, item.time)
                            }
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Take
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              skipIntake(item.medication.id, item.time)
                            }
                          >
                            Skip
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* All medications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                <h2 className="text-xl font-semibold">My Medications</h2>
              </div>
              <Button onClick={() => setShowAddForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>

            {/* Add medication form */}
            {showAddForm && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-4">Add New Medication</h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <Label htmlFor="med-name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="med-name"
                      placeholder="e.g., Vitamin D3"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <Label>Type</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(
                        [
                          "prescription",
                          "supplement",
                          "ayurvedic",
                          "homeopathic",
                          "other",
                        ] as const
                      ).map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant={medType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMedType(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Dosage & Purpose */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="med-dosage">
                        Dosage <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="med-dosage"
                        placeholder="e.g., 500mg, 2 tablets"
                        value={medDosage}
                        onChange={(e) => setMedDosage(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="med-purpose">
                        Purpose <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="med-purpose"
                        placeholder="e.g., Bone health"
                        value={medPurpose}
                        onChange={(e) => setMedPurpose(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Schedule times */}
                  <div>
                    <Label>
                      Times <span className="text-destructive">*</span>
                    </Label>
                    <div className="space-y-2 mt-2">
                      {medTimes.map((time, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...medTimes];
                              newTimes[index] = e.target.value;
                              setMedTimes(newTimes);
                            }}
                          />
                          {medTimes.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setMedTimes(
                                  medTimes.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMedTimes([...medTimes, ""])}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time
                      </Button>
                    </div>
                  </div>

                  {/* With meal checkbox */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={medWithMeal}
                      onChange={(e) => setMedWithMeal(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Take with meal</span>
                  </label>

                  {/* Inventory */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="med-inventory">Current Stock</Label>
                      <Input
                        id="med-inventory"
                        type="number"
                        min="0"
                        value={medInventory}
                        onChange={(e) => setMedInventory(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="med-unit">Unit</Label>
                      <Input
                        id="med-unit"
                        placeholder="tablets"
                        value={medUnit}
                        onChange={(e) => setMedUnit(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="med-threshold">Low Alert</Label>
                      <Input
                        id="med-threshold"
                        type="number"
                        min="0"
                        value={medLowThreshold}
                        onChange={(e) => setMedLowThreshold(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <Label htmlFor="med-instructions">
                      Instructions (optional)
                    </Label>
                    <Input
                      id="med-instructions"
                      placeholder="e.g., Take in the morning on empty stomach"
                      value={medInstructions}
                      onChange={(e) => setMedInstructions(e.target.value)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button onClick={addMedication}>Add Medication</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setMedName("");
                        setMedDosage("");
                        setMedPurpose("");
                        setMedTimes([""]);
                        setMedInventory("30");
                        setMedInstructions("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Medications list */}
            {medications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No medications added yet</p>
                <p className="text-sm mt-2">
                  Click &quot;Add Medication&quot; to start tracking
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className={`border rounded-lg p-4 ${
                      !med.active ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{med.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {med.type}
                          </Badge>
                          {!med.active && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} • {med.purpose}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMedicationStatus(med.id)}
                        >
                          {med.active ? "Pause" : "Resume"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMedication(med.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Schedule:</p>
                      <div className="flex flex-wrap gap-1">
                        {med.schedule.times.map((time, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="text-xs"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {time}
                          </Badge>
                        ))}
                        {med.schedule.withMeal && (
                          <Badge variant="secondary" className="text-xs">
                            with meal
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Inventory */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>
                          {med.inventory.current} {med.inventory.unit}
                        </span>
                        {med.inventory.current <=
                          med.inventory.lowThreshold && (
                          <Badge variant="error" className="text-xs ml-2">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Instructions */}
                    {med.instructions && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {med.instructions}
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
          {/* Quick stats */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5" />
              <h3 className="font-semibold">Quick Stats</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Medications
                </p>
                <p className="text-2xl font-bold">
                  {medications.filter((m) => m.active).length}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Today&apos;s Doses
                </p>
                <p className="text-2xl font-bold">{todaySchedule.length}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Adherence Rate
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{adherenceRate}%</p>
                  {adherenceRate >= 80 && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Low Stock Alerts
                </p>
                <p className="text-2xl font-bold">
                  {
                    medications.filter(
                      (m) =>
                        m.active &&
                        m.inventory.current <= m.inventory.lowThreshold
                    ).length
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Reminders info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5" />
              <h3 className="font-semibold">Reminders</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p>
                  Set reminders in Settings to get notified before medication
                  times
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p>
                  You&apos;ll receive alerts when inventory falls below low
                  stock threshold
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p>
                  Track your adherence to stay on top of your treatment plan
                </p>
              </div>
            </div>
          </Card>

          {/* Medical disclaimer */}
          <Card className="p-6 border-warning bg-warning/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold">Medical Disclaimer</p>
                <p className="text-xs text-muted-foreground">
                  This medication tracker is for informational purposes only.
                  Never adjust medication dosages or schedules without
                  consulting your healthcare provider. Always follow your
                  doctor&apos;s instructions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
