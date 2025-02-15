import { Analytics } from "@vercel/analytics/react"

import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'VGC Leaderboard',
  description: 'ELO Leaderboard for VGC tournaments on Limitless',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}
