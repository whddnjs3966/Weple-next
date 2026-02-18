import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display, Dancing_Script } from 'next/font/google'

const cormorant = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-serif',
  display: 'swap'
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cursive',
  display: 'swap'
})

import { Cinzel } from 'next/font/google'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cinzel',
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
    <html lang="ko" className={`${cormorant.variable} ${dancingScript.variable} ${cinzel.variable} antialiased`}>
      <body className="font-sans">
        <SessionGuard />
        {children}
      </body>
    </html>
  )
}
