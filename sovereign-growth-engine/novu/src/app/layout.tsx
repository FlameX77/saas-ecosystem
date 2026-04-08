import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
export const metadata: Metadata = {
  title: "Novu — Recover more. Automatically.",
  description: "AI revenue recovery platform. Automatically recover lost revenue from missed appointments, forgotten leads, and unpaid invoices.",
  openGraph: { title: "Novu — Recover more. Automatically.", description: "AI revenue recovery platform.", type: "website", siteName: "Novu" },
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-1)" } }} />
      </body>
    </html>
  );
}
