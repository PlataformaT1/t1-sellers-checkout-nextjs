import type { Metadata } from 'next'
import Providers from '@components/Layout/providers'

export const metadata: Metadata = {
  title: 'Workspace',
  description: 'T1 ecosystem workspace',
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
