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
  metadataBase: new URL('https://wepln.com'),
  title: {
    default: "WEPLN - 나만의 웨딩플래너",
    template: "%s | WEPLN"
  },
  description: "당신만의 완벽한 웨딩을 위한 스마트 플래너. 예산 관리부터 일정 체크까지 한 번에 해결하세요.",
  keywords: ["웨딩", "웨딩플래너", "결혼준비", "가계부", "결혼일정", "스드메", "Wepln", "위플랜"],
  authors: [{ name: "Wepln Team" }],
  creator: "Wepln Team",
  publisher: "Wepln",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "WEPLN - 나만의 웨딩플래너",
    description: "당신만의 완벽한 웨딩을 위한 스마트 플래너. 예산 관리부터 일정 체크까지 한 번에 해결하세요.",
    url: "https://wepln.com",
    siteName: "WEPLN",
    images: [
      {
        url: "/og-image.png", // Will need to make sure this image exists or change it later
        width: 1200,
        height: 630,
        alt: "Wepln - 웨딩 플래너 Preview",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Wepln - 당신만의 완벽한 웨딩 플래너",
    description: "당신만의 완벽한 웨딩을 위한 스마트 플래너",
    images: ["/og-image.png"],
  },
  // If you ever need Naver-specific meta tags for site verification 
  // without relying solely on the HTML file method:
  // verification: {
  //   other: {
  //     "naver-site-verification": ["YOUR_VERIFICATION_CODE_HERE"]
  //   }
  // }
};

import SessionGuard from '@/components/SessionGuard'
import InAppBrowserBlocker from '@/components/InAppBrowserBlocker'
import AnalyticsTracker from '@/components/AnalyticsTracker'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${cormorant.variable} ${dancingScript.variable} ${cinzel.variable} antialiased`}>
      <body className="font-sans">
        <InAppBrowserBlocker />
        <AnalyticsTracker />
        <SessionGuard />
        {children}
      </body>
    </html>
  )
}
