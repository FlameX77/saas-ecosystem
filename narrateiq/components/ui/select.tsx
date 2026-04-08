import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
          !props.value && "text-gray-400",
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && <option value="" disabled hidden>{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  )
);
Select.displayName = "Select";

export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);
