import type { Metadata } from "next"
import "./globals.css"
import ToastProvider from "@/components/ui/Toast"

export const metadata: Metadata = {
  title: "AXON — Your AI Growth Engine",
  description: "Five autonomous AI agents that run your entire sales, outreach, content, and monitoring. Deploy your AI business operating system today.",
  keywords: ["AI", "SaaS", "sales automation", "marketing automation", "business operating system", "AI agents", "lead generation", "growth engine"],
  openGraph: {
    title: "AXON — Your AI Growth Engine",
    description: "Deploy five AI agents that fully automate your business growth engine. Zero headcount. Infinite scale.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
