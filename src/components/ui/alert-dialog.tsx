"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { X } from "lucide-react";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: AlertDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleCancel}
            className="cursor-pointer rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-600">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          {onCancel && (
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button
            variant={variant === "destructive" ? "secondary" : "default"}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </>
  );
}

// Hook for simpler usage
export function useAlertDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
  });

  const showAlert = React.useCallback(
    (config: Omit<typeof dialogState, "open">) => {
      setDialogState({ ...config, open: true });
    },
    []
  );

  const hideAlert = React.useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const AlertDialogComponent = React.useCallback(
    () => (
      <AlertDialog
        open={dialogState.open}
        onOpenChange={hideAlert}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
        onCancel={dialogState.onCancel}
        variant={dialogState.variant}
      />
    ),
    [dialogState, hideAlert]
  );

  return {
    showAlert,
    hideAlert,
    AlertDialog: AlertDialogComponent,
  };
}
