import type { Metadata } from 'next'
import { Providers } from './providers'
import '../index.css'

export const metadata: Metadata = {
  title: 'Gnosis Launchpad',
  description: 'Gnosis Beacon Chain Launchpad',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}