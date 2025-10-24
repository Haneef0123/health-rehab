import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, AlertTriangle } from "lucide-react";

interface MedicalSectionProps {
  conditions: string[];
  newCondition: string;
  sittingTolerance: number;
  chronicPainAreas: string[];
  newPainArea: string;
  height: number;
  weight: number;
  primaryDoctor: string;
  physiotherapist: string;
  onNewConditionChange: (value: string) => void;
  onAddCondition: () => void;
  onRemoveCondition: (index: number) => void;
  onSittingToleranceChange: (value: number) => void;
  onNewPainAreaChange: (value: string) => void;
  onAddPainArea: () => void;
  onRemovePainArea: (index: number) => void;
  onHeightChange: (value: number) => void;
  onWeightChange: (value: number) => void;
  onPrimaryDoctorChange: (value: string) => void;
  onPhysiotherapistChange: (value: string) => void;
}

export function MedicalSection({
  conditions,
  newCondition,
  sittingTolerance,
  chronicPainAreas,
  newPainArea,
  height,
  weight,
  primaryDoctor,
  physiotherapist,
  onNewConditionChange,
  onAddCondition,
  onRemoveCondition,
  onSittingToleranceChange,
  onNewPainAreaChange,
  onAddPainArea,
  onRemovePainArea,
  onHeightChange,
  onWeightChange,
  onPrimaryDoctorChange,
  onPhysiotherapistChange,
}: MedicalSectionProps) {
  return (
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
              onChange={(e) => onNewConditionChange(e.target.value)}
              placeholder="Add a condition (e.g., cervical lordosis)"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onAddCondition();
                }
              }}
            />
            <Button onClick={onAddCondition} className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {conditions.map((condition, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {condition}
                <button
                  onClick={() => onRemoveCondition(index)}
                  className="cursor-pointer ml-2 hover:text-error"
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
                onSittingToleranceChange(parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Chronic Pain Areas</Label>
            <div className="flex gap-2">
              <Input
                value={newPainArea}
                onChange={(e) => onNewPainAreaChange(e.target.value)}
                placeholder="Add pain area (e.g., lower back)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    onAddPainArea();
                  }
                }}
              />
              <Button onClick={onAddPainArea} className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {chronicPainAreas.map((area, index) => (
                <Badge key={index} variant="error" className="text-sm">
                  {area}
                  <button
                    onClick={() => onRemovePainArea(index)}
                    className="cursor-pointer ml-2 hover:text-white"
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
              onChange={(e) => onHeightChange(parseInt(e.target.value) || 0)}
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
              onChange={(e) => onWeightChange(parseInt(e.target.value) || 0)}
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
              onChange={(e) => onPrimaryDoctorChange(e.target.value)}
              placeholder="Dr. Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="physio">Physiotherapist</Label>
            <Input
              id="physio"
              value={physiotherapist}
              onChange={(e) => onPhysiotherapistChange(e.target.value)}
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
                This information is for tracking purposes only. Always consult
                with qualified healthcare professionals for medical advice,
                diagnosis, and treatment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
