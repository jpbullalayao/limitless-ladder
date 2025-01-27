import './globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'VGC Ladder',
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
      </body>
    </html>
  )
}
