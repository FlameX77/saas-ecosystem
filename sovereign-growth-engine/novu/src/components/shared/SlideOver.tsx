"use client";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export function SlideOver({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-xl", className)}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text-1">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-text-3 hover:text-text-1"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
