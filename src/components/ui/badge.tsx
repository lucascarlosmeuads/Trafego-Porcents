
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary/80 to-primary text-primary-foreground hover:from-primary hover:to-primary/90 shadow-lg shadow-primary/20",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary/80 to-secondary text-secondary-foreground hover:from-secondary hover:to-secondary/90 shadow-lg shadow-secondary/20",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive/80 to-destructive text-destructive-foreground hover:from-destructive hover:to-destructive/90 shadow-lg shadow-destructive/20",
        outline: "text-foreground bg-gradient-to-r from-background/50 to-background/70 backdrop-blur-sm shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
