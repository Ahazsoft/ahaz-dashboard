import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Ahaz Dashboard',
  description: 'Created by ahaz software',
  generator: 'Ahaz.io',
  icons: {
    icon: [
      {
        url: '/Favicon-02.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Favicon-02.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/Favicon-02.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
