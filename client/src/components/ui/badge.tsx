import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary bg-opacity-10 text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-red-100 text-red-800 hover:bg-red-200/80",
        outline:
          "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
        active:
          "bg-primary-50 text-primary-700 hover:bg-primary-100/80",
        paid:
          "bg-green-100 text-green-800 hover:bg-green-200/80",
        overdue:
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-200/80",
        defaulted:
          "bg-red-100 text-red-800 hover:bg-red-200/80",
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
