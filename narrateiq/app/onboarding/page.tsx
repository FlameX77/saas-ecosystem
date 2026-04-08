"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingData {
  companyName: string;
  industry: string;
  accountingSoftware: string;
  reportingFrequency: string;
}

const TOTAL_STEPS = 3;

const STEP_LABELS = ["Your Company", "Your Tools", "Your Workflow"];

// ─── Step components ──────────────────────────────────────────────────────────

function Step1({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (k: keyof OnboardingData, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tell us about your company</h2>
        <p className="text-gray-500 mt-1 text-sm">
          This helps us tailor the report language and benchmarks to your industry.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            placeholder="Acme Clinic LLC"
            value={data.companyName}
            onChange={(e) => onChange("companyName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="industry">Industry</Label>
          <Select
            id="industry"
            value={data.industry}
            onChange={(e) => onChange("industry", e.target.value)}
            placeholder="Select your industry"
          >
            <SelectItem value="clinic">🏥 Clinic / Healthcare</SelectItem>
            <SelectItem value="retail">🛍️ Retail</SelectItem>
            <SelectItem value="fnb">🍽️ Food &amp; Beverage</SelectItem>
            <SelectItem value="services">💼 Professional Services</SelectItem>
            <SelectItem value="other">🏢 Other</SelectItem>
          </Select>
        </div>
      </div>
    </div>
  );
}

function Step2({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (k: keyof OnboardingData, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">What accounting software do you use?</h2>
        <p className="text-gray-500 mt-1 text-sm">
          We&apos;ll pre-configure the parser to handle your export format correctly.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: "zoho_books", label: "Zoho Books", desc: "Export P&L, Balance Sheet or Trial Balance CSV" },
          { value: "quickbooks", label: "QuickBooks", desc: "Export standard financial reports as CSV or Excel" },
          { value: "manual_csv", label: "Manual / CSV", desc: "Your own spreadsheet or custom CSV export" },
          { value: "other", label: "Other", desc: "We support most CSV and Excel formats" },
        ].map(({ value, label, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange("accountingSoftware", value)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              data.accountingSoftware === value
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="font-medium text-gray-900">{label}</div>
            <div className="text-sm text-gray-500 mt-0.5">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (k: keyof OnboardingData, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">How often do you report?</h2>
        <p className="text-gray-500 mt-1 text-sm">
          We&apos;ll default the report comparison periods to match your cadence.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: "monthly", label: "Monthly", desc: "Month-over-month comparisons, 12 periods per year" },
          { value: "quarterly", label: "Quarterly", desc: "Q-o-Q comparisons, 4 periods per year" },
          { value: "annual", label: "Annual", desc: "Year-over-year comparisons" },
        ].map(({ value, label, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange("reportingFrequency", value)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              data.reportingFrequency === value
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="font-medium text-gray-900">{label}</div>
            <div className="text-sm text-gray-500 mt-0.5">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    companyName: "",
    industry: "",
    accountingSoftware: "",
    reportingFrequency: "",
  });

  function setField(key: keyof OnboardingData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validateStep(): string | null {
    if (step === 1) {
      if (!data.companyName.trim()) return "Company name is required.";
      if (!data.industry) return "Please select your industry.";
    }
    if (step === 2 && !data.accountingSoftware) {
      return "Please select your accounting software.";
    }
    if (step === 3 && !data.reportingFrequency) {
      return "Please select your reporting frequency.";
    }
    return null;
  }

  function handleNext() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    const err = validateStep();
    if (err) { setError(err); return; }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
      setIsSubmitting(false);
    }
  }

  const progressValue = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">NarrateIQ</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              {STEP_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={i + 1 <= step ? "text-indigo-600 font-medium" : ""}
                >
                  {label}
                </span>
              ))}
            </div>
            <Progress value={progressValue} />
            <p className="text-xs text-gray-400">Step {step} of {TOTAL_STEPS}</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && <Step1 data={data} onChange={setField} />}
          {step === 2 && <Step2 data={data} onChange={setField} />}
          {step === 3 && <Step3 data={data} onChange={setField} />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setError(null); setStep((s) => s - 1); }}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Get started
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
