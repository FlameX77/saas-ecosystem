import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// Body / UI font — purpose-built for screen interfaces, exceptional at small sizes
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Display / heading font — bold personality, organic letterforms, modern grotesque
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Revivo — AI Revenue Recovery',
  description: 'Recover lost revenue automatically with AI. Built for dental clinics, med spas, law firms, and coaches.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${bricolage.variable} antialiased`}
        style={{ background: '#0F1117', color: '#E8ECF3', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}
      >
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  )
}
