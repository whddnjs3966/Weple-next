import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

export const metadata: Metadata = {
  title: "Wepln - 웨딩 플래너",
  description: "당신만의 완벽한 웨딩을 위한 스마트 플래너",
};

import SessionGuard from '@/components/SessionGuard'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className="font-sans">
        <SessionGuard />
        {children}
      </body>
    </html>
  )
}
