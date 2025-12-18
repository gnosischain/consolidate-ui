import type { Metadata } from 'next'
import { cookies } from 'next/headers'
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'gnosis'

  return (
    <html lang="en" data-theme={theme}>
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