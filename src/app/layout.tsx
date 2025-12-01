import type { Metadata } from 'next'
import { Providers } from './providers'
import '../index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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
          <div className="w-full flex flex-col min-h-screen bg-gradient-to-b from-base-200 from-45% to-primary/10">
            <Navbar />
            {children}
          </div>
        </Providers>
        <Footer />
      </body>
    </html>
  )
}