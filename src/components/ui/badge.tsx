import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
        secondary: "bg-secondary-100 text-secondary-700 hover:bg-secondary-200",
        success: "bg-success-50 text-success-700 hover:bg-success-100",
        warning: "bg-warning-50 text-warning-700 hover:bg-warning-100",
        error: "bg-error-50 text-error-700 hover:bg-error-100",
        outline:
          "border-2 border-primary-200 text-primary-700 hover:bg-primary-50",
        ghost: "hover:bg-primary-50 text-primary-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
