"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PAIN_SCALE } from "@/types/pain";

interface PainScaleSelectorProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function PainScaleSelector({
  value,
  onChange,
  className,
}: PainScaleSelectorProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const displayLevel = hoveredLevel !== null ? hoveredLevel : value;
  const displayScale = PAIN_SCALE[displayLevel as keyof typeof PAIN_SCALE];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current level display */}
      <div className="text-center">
        <div
          className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold text-white shadow-lg transition-all"
          style={{ backgroundColor: displayScale.color }}
        >
          {displayLevel}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {displayScale.label}
        </h3>
        <p className="text-sm text-gray-600">{displayScale.description}</p>
      </div>

      {/* Scale buttons */}
      <div className="grid grid-cols-11 gap-2">
        {Object.entries(PAIN_SCALE).map(([level, scale]) => {
          const numLevel = parseInt(level);
          const isSelected = value === numLevel;
          const isHovered = hoveredLevel === numLevel;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(numLevel)}
              onMouseEnter={() => setHoveredLevel(numLevel)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={cn(
                "cursor-pointer relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all",
                "hover:scale-110 hover:shadow-lg",
                isSelected &&
                  "scale-110 shadow-lg ring-4 ring-white ring-offset-2"
              )}
              style={{
                backgroundColor: scale.color,
                color: numLevel <= 2 ? "#374151" : "white",
              }}
              aria-label={`Pain level ${level}: ${scale.label}`}
            >
              {numLevel}
              {isSelected && (
                <div className="absolute -bottom-1 h-1.5 w-full rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scale legend */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>No pain</span>
        <span>Worst possible</span>
      </div>
    </div>
  );
}
