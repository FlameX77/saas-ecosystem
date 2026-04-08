import * as React from "react";
import { cn } from "@/lib/utils";
const badgeVariants = {
  default: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-surface-2 text-text-2 border-border",
  success: "bg-green/10 text-green border-green/20",
  warning: "bg-amber/10 text-amber border-amber/20",
  destructive: "bg-red/10 text-red border-red/20",
  outline: "text-text-2 border-border",
};
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> { variant?: keyof typeof badgeVariants }
function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors", badgeVariants[variant], className)} {...props} />;
}
export { Badge };
