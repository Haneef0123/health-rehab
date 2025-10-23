"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PainScaleSelector } from "./pain-scale-selector";
import { usePainStore } from "@/stores";
import { X } from "lucide-react";

const painLogSchema = z.object({
  level: z.number().min(0).max(10),
  location: z.array(z.string()).min(1, "Please select at least one location"),
  type: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  activities: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
});

type PainLogFormData = z.infer<typeof painLogSchema>;

interface PainLogFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const COMMON_LOCATIONS = [
  "Neck",
  "Upper Back",
  "Lower Back",
  "Shoulders",
  "Head",
  "Arms",
];

const COMMON_TYPES = [
  "Sharp",
  "Dull",
  "Aching",
  "Burning",
  "Tingling",
  "Numbness",
];

const COMMON_TRIGGERS = [
  "Sitting",
  "Standing",
  "Walking",
  "Lying down",
  "Stress",
  "Poor posture",
  "Exercise",
  "Weather",
];

export function PainLogForm({ onClose, onSuccess }: PainLogFormProps) {
  const { addLog } = usePainStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PainLogFormData>({
    resolver: zodResolver(painLogSchema),
    defaultValues: {
      level: 5,
      location: [],
      type: [],
      triggers: [],
      activities: "",
      medications: "",
      notes: "",
    },
  });

  const painLevel = watch("level");

  const toggleLocation = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter((l) => l !== location)
      : [...selectedLocations, location];
    setSelectedLocations(newLocations);
    setValue("location", newLocations);
  };

  const toggleType = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    setValue("type", newTypes);
  };

  const toggleTrigger = (trigger: string) => {
    const newTriggers = selectedTriggers.includes(trigger)
      ? selectedTriggers.filter((t) => t !== trigger)
      : [...selectedTriggers, trigger];
    setSelectedTriggers(newTriggers);
    setValue("triggers", newTriggers);
  };

  const onSubmit = async (data: PainLogFormData) => {
    setIsSubmitting(true);
    try {
      await addLog({
        userId: "user-1", // Single user
        level: data.level,
        location: data.location as any[], // Type assertion for now
        type: data.type as any[], // Type assertion for now
        triggers: data.triggers || [],
        activity: data.activities || undefined,
        notes: data.notes || undefined,
        timestamp: new Date(),
        updatedAt: new Date(),
      });
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Failed to add pain log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Log Pain Level</h2>
          <p className="text-sm text-gray-600">
            Track your pain to identify patterns and progress
          </p>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Pain Scale */}
      <div>
        <Label>Pain Level</Label>
        <PainScaleSelector
          value={painLevel}
          onChange={(value) => setValue("level", value)}
          className="mt-2"
        />
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location">
          Location <span className="text-accent-500">*</span>
        </Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_LOCATIONS.map((location) => (
            <Button
              key={location}
              type="button"
              variant={
                selectedLocations.includes(location) ? "default" : "outline"
              }
              size="sm"
              onClick={() => toggleLocation(location)}
            >
              {location}
            </Button>
          ))}
        </div>
        {errors.location && (
          <p className="mt-1 text-sm text-accent-500">
            {errors.location.message}
          </p>
        )}
      </div>

      {/* Pain Type */}
      <div>
        <Label htmlFor="type">Pain Type</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Triggers */}
      <div>
        <Label>Triggers (select all that apply)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_TRIGGERS.map((trigger) => (
            <Button
              key={trigger}
              type="button"
              variant={
                selectedTriggers.includes(trigger) ? "default" : "outline"
              }
              size="sm"
              onClick={() => toggleTrigger(trigger)}
            >
              {trigger}
            </Button>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div>
        <Label htmlFor="activities">Recent Activities</Label>
        <Input
          id="activities"
          placeholder="What were you doing before the pain?"
          className="mt-2"
          {...register("activities")}
        />
      </div>

      {/* Medications */}
      <div>
        <Label htmlFor="medications">Medications Taken</Label>
        <Input
          id="medications"
          placeholder="List any pain relief medications..."
          className="mt-2"
          {...register("medications")}
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Any other relevant details..."
          className="mt-2 w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          {...register("notes")}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Saving..." : "Save Pain Log"}
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
