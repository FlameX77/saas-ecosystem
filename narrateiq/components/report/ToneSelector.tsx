"use client";

import { cn } from "@/lib/utils/cn";
import type { NarrativeTone } from "@/lib/ai/prompts/narrativePrompt";

interface ToneSelectorProps {
  value: NarrativeTone;
  onChange: (tone: NarrativeTone) => void;
  disabled?: boolean;
}

const TONES: { value: NarrativeTone; label: string; desc: string; icon: string }[] = [
  {
    value: "board_meeting",
    label: "Board Meeting",
    desc: "Formal, authoritative, number-led",
    icon: "🏛️",
  },
  {
    value: "investor_update",
    label: "Investor Update",
    desc: "Strategic, growth-focused, transparent",
    icon: "📈",
  },
  {
    value: "internal_review",
    label: "Internal Review",
    desc: "Direct, operational, candid",
    icon: "🔍",
  },
];

export function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Report tone</p>
      <div className="grid grid-cols-3 gap-2">
        {TONES.map((tone) => (
          <button
            key={tone.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tone.value)}
            className={cn(
              "flex flex-col items-start p-3 rounded-lg border-2 text-left transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              value === tone.value
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <span className="text-lg mb-1">{tone.icon}</span>
            <span className="text-sm font-medium text-gray-900">{tone.label}</span>
            <span className="text-xs text-gray-400 mt-0.5 leading-tight">{tone.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
