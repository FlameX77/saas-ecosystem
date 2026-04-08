"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  reportTitle: string;
  contentRef: React.RefObject<HTMLElement>;
}

export function ExportButton({ reportTitle, contentRef }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    // Dynamically import html2pdf.js (client-side only, not in package.json yet)
    // Falls back to window.print() if unavailable
    try {
      // Try html2pdf if installed
      const html2pdf = (await import("html2pdf.js" as never).catch(() => null)) as
        | { default: (element: HTMLElement, options: object) => { save: () => void } }
        | null;

      if (html2pdf && contentRef.current) {
        html2pdf
          .default(contentRef.current, {
            margin: [15, 20],
            filename: `${reportTitle.replace(/[^a-z0-9]/gi, "_")}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .save();
        setIsExporting(false);
        return;
      }
    } catch {
      // html2pdf not available — fall through to print
    }

    // Fallback: browser print dialog
    const printWindow = window.open("", "_blank");
    if (printWindow && contentRef.current) {
      const content = contentRef.current.innerHTML;
      // Collect all stylesheets
      const styles = Array.from(document.styleSheets)
        .map((sheet) => {
          try {
            return Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch { return ""; }
        })
        .join("\n");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${reportTitle}</title>
            <style>
              ${styles}
              @media print {
                body { font-family: Georgia, serif; font-size: 12pt; color: #000; }
                h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
                .no-print { display: none !important; }
              }
              body { padding: 20px; max-width: 800px; margin: 0 auto; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }

    setIsExporting(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="no-print"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export PDF
    </Button>
  );
}
