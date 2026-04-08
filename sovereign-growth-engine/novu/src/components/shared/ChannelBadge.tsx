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
