import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}
export function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}
export function stageLabel(stage: string): string {
  const labels: Record<string, string> = { new_lead: "New Lead", contacted: "Contacted", replied: "Replied", appointment_booked: "Booked", recovered: "Recovered", lost: "Lost" };
  return labels[stage] || stage;
}
export function stageColor(stage: string): string {
  const colors: Record<string, string> = { new_lead: "#0066ff", contacted: "#ffb020", replied: "#00b8d9", appointment_booked: "#00c896", recovered: "#00c896", lost: "#ff4444" };
  return colors[stage] || "#8896ab";
}
export function sanitizeHtml(str: string): string {
  if (!str) return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
