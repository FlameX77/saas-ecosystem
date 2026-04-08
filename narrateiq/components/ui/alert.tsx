import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-gray-50 text-gray-900",
        destructive: "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
        warning: "border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600",
        info: "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}
