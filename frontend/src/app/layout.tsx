import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Little Stars Pre-School | Management System',
  description: 'Modern Pre-School Management System for Indian Schools',
  keywords: ['preschool', 'school management', 'ERP', 'education', 'India'],
  authors: [{ name: 'Little Stars Pre-School' }],
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
