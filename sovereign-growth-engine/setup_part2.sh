#!/bin/bash
set -e

cat > novu/src/components/ui/button.tsx << 'ENDFILE'
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: { default: "bg-primary text-white shadow hover:bg-primary-glow", destructive: "bg-red text-white shadow-sm hover:bg-red/80", outline: "border border-border bg-transparent text-text-1 hover:bg-surface-2 hover:text-text-1", secondary: "bg-surface-2 text-text-1 shadow-sm hover:bg-surface-2/80", ghost: "text-text-2 hover:bg-surface-2 hover:text-text-1", link: "text-primary underline-offset-4 hover:underline" },
      size: { default: "h-9 px-4 py-2", sm: "h-8 rounded-md px-3 text-xs", lg: "h-11 rounded-lg px-8 text-base", icon: "h-9 w-9" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };
ENDFILE

cat > novu/src/components/ui/input.tsx << 'ENDFILE'
import * as React from "react";
import { cn } from "@/lib/utils";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return <input type={type} className={cn("flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm text-text-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />;
});
Input.displayName = "Input";
export { Input };
ENDFILE

cat > novu/src/components/ui/card.tsx << 'ENDFILE'
import * as React from "react";
import { cn } from "@/lib/utils";
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border border-border bg-surface text-text-1 shadow", className)} {...props} />
));
Card.displayName = "Card";
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";
export { Card, CardContent };
ENDFILE

cat > novu/src/components/ui/badge.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/ui/textarea.tsx << 'ENDFILE'
import * as React from "react";
import { cn } from "@/lib/utils";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return <textarea className={cn("flex min-h-[60px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-1 shadow-sm placeholder:text-text-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";
export { Textarea };
ENDFILE

cat > novu/src/components/ui/label.tsx << 'ENDFILE'
"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn("text-sm font-medium leading-none text-text-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
ENDFILE

cat > novu/src/components/ui/progress.tsx << 'ENDFILE'
"use client";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-2", className)} {...props}>
    <ProgressPrimitive.Indicator className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)} style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };
ENDFILE

cat > novu/src/components/ui/avatar.tsx << 'ENDFILE'
"use client";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-text-2", className)} {...props} />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
export { Avatar, AvatarFallback };
ENDFILE

cat > novu/src/components/ui/skeleton.tsx << 'ENDFILE'
import { cn } from "@/lib/utils";
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-surface-2", className)} {...props} />;
}
export { Skeleton };
ENDFILE

cat > novu/src/components/ui/tabs.tsx << 'ENDFILE'
"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-surface-2 p-1 text-text-3", className)} {...props} />
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface data-[state=active]:text-text-1 data-[state=active]:shadow-sm", className)} {...props} />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
export { Tabs, TabsList, TabsTrigger, TabsContent };
ENDFILE

cat > novu/src/components/ui/dialog.tsx << 'ENDFILE'
"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-text-3">
        <X className="h-4 w-4" /><span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-text-1", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-text-3", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription };
ENDFILE

cat > novu/src/components/ui/select.tsx << 'ENDFILE'
"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-1 shadow-sm placeholder:text-text-3 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild><ChevronDown className="h-4 w-4 opacity-50" /></SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface text-text-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)} position={position} {...props}>
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-surface-2 focus:text-text-1 data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator><Check className="h-4 w-4" /></SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
ENDFILE

cat > novu/src/components/ui/dropdown-menu.tsx << 'ENDFILE'
"use client";
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface p-1 text-text-1 shadow-md", className)} {...props} />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-surface-2 focus:text-text-1 data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
ENDFILE

cat > novu/src/components/ui/switch.tsx << 'ENDFILE'
"use client";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root className={cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-2", className)} {...props} ref={ref}>
    <SwitchPrimitives.Thumb className={cn("pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0")} />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;
export { Switch };
ENDFILE

cat > novu/src/components/shared/ChannelBadge.tsx << 'ENDFILE'
import { MessageSquare, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
export function ChannelBadge({ channel, className }: { channel: string; className?: string }) {
  const config: Record<string, { icon: any; label: string; color: string }> = {
    sms: { icon: MessageSquare, label: "SMS", color: "text-green bg-green/10" },
    email: { icon: Mail, label: "Email", color: "text-cyan bg-cyan/10" },
    whatsapp: { icon: Phone, label: "WhatsApp", color: "text-green bg-green/10" },
  };
  const c = config[channel] || config.sms;
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", c.color, className)}>
      <Icon className="h-3 w-3" />{c.label}
    </span>
  );
}
ENDFILE

cat > novu/src/components/shared/UrgencyBadge.tsx << 'ENDFILE'
import { cn } from "@/lib/utils";
export function UrgencyBadge({ days, className }: { days: number; className?: string }) {
  if (days <= 3) return <span className={cn("inline-flex items-center rounded-md bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber", className)}>Warm</span>;
  if (days <= 7) return <span className={cn("inline-flex items-center rounded bg-amber/20 px-2 py-0.5 text-xs font-medium text-amber", className)}>Hot</span>;
  return <span className={cn("inline-flex items-center rounded bg-red/10 px-2 py-0.5 text-xs font-medium text-red", className)}>Urgent</span>;
}
ENDFILE

cat > novu/src/components/shared/SlideOver.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/shared/CommandPalette.tsx << 'ENDFILE'
"use client";
import { useEffect, useState, useRef } from "react";
import { Search, LayoutDashboard, KanbanSquare, MessageSquare, Workflow, Sparkles, Users, BarChart3, Plug, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
interface CommandItem { label: string; icon: any; href: string; keywords: string[] }
const items: CommandItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", keywords: ["home", "overview"] },
  { label: "Pipeline", icon: KanbanSquare, href: "/pipeline", keywords: ["kanban", "leads"] },
  { label: "Inbox", icon: MessageSquare, href: "/inbox", keywords: ["messages", "chat"] },
  { label: "Sequences", icon: Workflow, href: "/sequences", keywords: ["automation", "follow up"] },
  { label: "Generate", icon: Sparkles, href: "/generate", keywords: ["ai", "message"] },
  { label: "Contacts", icon: Users, href: "/contacts", keywords: ["people", "list"] },
  { label: "Analytics", icon: BarChart3, href: "/analytics", keywords: ["stats", "reports"] },
  { label: "Integrations", icon: Plug, href: "/integrations", keywords: ["connect", "tools"] },
  { label: "Settings", icon: Settings, href: "/settings", keywords: ["config", "profile"] },
];
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const filtered = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.keywords.some((k) => k.includes(query.toLowerCase())));
  useEffect(() => { if (open) { setQuery(""); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open ? onClose() : onClose(); }
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && filtered[selected]) { router.push(filtered[selected].href); onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, router, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-text-3" />
          <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelected(0); }} placeholder="Search pages..." className="flex-1 bg-transparent text-sm text-text-1 outline-none placeholder:text-text-3" />
          <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-3">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.href} onClick={() => { router.push(item.href); onClose(); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${i === selected ? "bg-primary/10 text-text-1" : "text-text-2 hover:bg-surface-2 hover:text-text-1"}`}>
                <Icon className="h-4 w-4" />{item.label}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-text-3">No results found</p>}
        </div>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/components/shared/EmptyState.tsx << 'ENDFILE'
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmptyState({ icon: Icon, title, description, action, actionLabel }: { icon: LucideIcon; title: string; description: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-4 rounded-full bg-surface-2 p-4"><Icon className="h-8 w-8 text-text-3" /></div>
      <h3 className="mb-1 text-sm font-semibold text-text-1">{title}</h3>
      <p className="mb-4 max-w-xs text-sm text-text-3">{description}</p>
      {action && actionLabel && <Button variant="outline" size="sm" onClick={action}>{actionLabel}</Button>}
    </div>
  );
}
ENDFILE

cat > novu/src/components/shared/Skeletons.tsx << 'ENDFILE'
import { Skeleton } from "@/components/ui/skeleton";
export function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
      <Skeleton className="mt-3 h-10 w-32" /><Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}
export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <Skeleton className="mb-4 h-4 w-32" /><Skeleton className="h-48 w-full" />
    </div>
  );
}
export function PipelineColumnSkeleton() {
  return (
    <div className="min-w-[280px] rounded-xl border border-border bg-background p-3">
      <div className="mb-3 flex items-center gap-2 px-1"><Skeleton className="h-2.5 w-2.5 rounded-full" /><Skeleton className="h-4 w-20" /></div>
      <div className="space-y-2">{[1, 2, 3].map((i) => (<div key={i} className="rounded-lg border border-border bg-surface p-4"><Skeleton className="mb-2 h-4 w-28" /><Skeleton className="h-3 w-20" /><Skeleton className="mt-2 h-3 w-16" /></div>))}</div>
    </div>
  );
}
export function ConversationListSkeleton() {
  return (
    <div className="space-y-0">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="border-b border-border px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><div className="flex-1"><Skeleton className="mb-1 h-4 w-28" /><Skeleton className="h-3 w-40" /></div></div></div>))}</div>
  );
}
ENDFILE
