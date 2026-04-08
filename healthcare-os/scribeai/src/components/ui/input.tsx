import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-200 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }

