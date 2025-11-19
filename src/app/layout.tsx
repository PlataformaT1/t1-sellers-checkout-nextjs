import type { Metadata } from 'next'
import Providers from '@components/Layout/providers'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'T1 sellers checkout',
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
