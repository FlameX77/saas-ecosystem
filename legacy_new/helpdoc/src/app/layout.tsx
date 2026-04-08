import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import ReactiveBackground from '@/components/ui/ReactiveBackground'
import Providers from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'ScribeAI — The AI Medical Scribe Built for the Gulf',
  description: 'Record your consultation. ScribeAI writes the clinical note in 8 seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
        <Providers>
          <ReactiveBackground />
          {children}
        </Providers>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f2f2f2',
            },
          }}
        />
      </body>
    </html>
  )
}
