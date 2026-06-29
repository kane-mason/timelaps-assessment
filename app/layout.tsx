import type { Metadata } from 'next'
import { Rethink_Sans, Fragment_Mono } from 'next/font/google'
import { AppShell } from '@/components/shell/AppShell'
import './globals.css'

// Timelaps brand fonts (see DESIGN.md): Rethink Sans for everything, Fragment Mono for labels.
const rethink = Rethink_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-rethink',
  display: 'swap',
})
const fragment = Fragment_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-fragment',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Aurora's Competitive Funnel Position",
  description: 'Where Aurora stands against Borealis, Cascade and Drift on the brand funnel, Q1 2026 vs Q4 2025.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rethink.variable} ${fragment.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
