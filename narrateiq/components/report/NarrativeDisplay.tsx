"use client";

import { useRef, useState, useCallback } from "react";
import { useCompletion } from "ai/react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToneSelector } from "./ToneSelector";
import { ExportButton } from "./ExportButton";
import { VarianceAlerts } from "./VarianceAlerts";
import { cn } from "@/lib/utils/cn";
import type { NarrativeTone } from "@/lib/ai/prompts/narrativePrompt";
import type { Variance } from "@/lib/parsers/normalizer";

// ─── Markdown renderer (minimal — avoids heavy library) ──────────────────────

function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    // Wrap list items
    .replace(/(<li.*<\/li>\n?)+/g, '<ol class="list-decimal list-inside space-y-1 my-4">$&</ol>');
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NarrativeDisplayProps {
  parsedDataId: string;
  variances: Variance[];
  reportTitle: string;
  currency?: string;
  reportId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NarrativeDisplay({
  parsedDataId,
  variances,
  reportTitle,
  currency = "AED",
  reportId,
}: NarrativeDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tone, setTone] = useState<NarrativeTone>("board_meeting");
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [narrativeId, setNarrativeId] = useState<string | null>(null);

  const { completion, complete, isLoading, error, stop } = useCompletion({
    api: "/api/generate/narrative",
    onResponse: (res) => {
      setDailyCount(Number(res.headers.get("X-Daily-Count")));
      setDailyLimit(Number(res.headers.get("X-Daily-Limit") ?? 10));
      setNarrativeId(res.headers.get("X-Narrative-Id"));
    },
  });

  const handleGenerate = useCallback(async () => {
    await complete("", {
      body: { parsedDataId, tone, currency, reportId },
    });
  }, [complete, parsedDataId, tone, currency, reportId]);

  const hasContent = !!completion;
  const limitReached = dailyCount !== null && dailyCount >= dailyLimit;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <ToneSelector value={tone} onChange={setTone} disabled={isLoading} />

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {!isLoading ? (
              <Button
                onClick={handleGenerate}
                disabled={limitReached}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {hasContent ? "Regenerate" : "Generate Report"}
              </Button>
            ) : (
              <Button variant="outline" onClick={stop} className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Stop
              </Button>
            )}

            {hasContent && (
              <ExportButton reportTitle={reportTitle} contentRef={contentRef as React.RefObject<HTMLElement>} />
            )}
          </div>

          {dailyCount !== null && (
            <span className="text-xs text-gray-400">
              {dailyCount}/{dailyLimit} reports today
            </span>
          )}
        </div>

        {limitReached && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
            Daily limit reached. Upgrade to Pro for unlimited reports.
          </p>
        )}

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {error.message}
          </p>
        )}
      </div>

      {/* Variance Alerts — always visible when data exists */}
      {variances.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <VarianceAlerts variances={variances} currency={currency} />
        </div>
      )}

      {/* Narrative output */}
      {(isLoading || hasContent) && (
        <div
          ref={contentRef}
          className={cn(
            "bg-white rounded-xl border border-gray-200 p-8",
            "prose prose-sm max-w-none",
            isLoading && "relative"
          )}
        >
          {/* Report header */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">{reportTitle}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {new Date().toLocaleDateString("en-AE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {narrativeId && (
                <span className="ml-3 text-xs font-mono text-gray-300">
                  #{narrativeId.slice(0, 8)}
                </span>
              )}
            </p>
          </div>

          {/* Streaming content */}
          {completion ? (
            <div
              className="[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-gray-100 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-1 [&_li]:text-gray-700"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(completion) }}
            />
          ) : (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              <span className="text-sm">Generating your narrative...</span>
            </div>
          )}

          {/* Blinking cursor during stream */}
          {isLoading && completion && (
            <span className="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5" />
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasContent && (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-indigo-500" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Ready to generate your report</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Select a tone above and click "Generate Report" to create your board-ready narrative.
          </p>
        </div>
      )}
    </div>
  );
}
