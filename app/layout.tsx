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
    default: "WEPLN 💍 설레는 결혼 준비, 나만의 웨딩플래너",
    template: "%s | WEPLN"
  },
  description: "당신의 가장 빛나는 순간을 위한 스마트 플래너예요 ✨ 복잡한 예산 관리부터 꼼꼼한 일정 체크까지, WEPLN과 함께 편안하고 행복하게 준비해 보세요 💖",
  keywords: ["웨딩", "웨딩플래너", "결혼준비", "가계부", "결혼일정", "스드메", "Wepln", "위플랜"],
  authors: [{ name: "Wepln Team" }],
  creator: "Wepln Team",
  publisher: "Wepln",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://wepln.com',
  },
  openGraph: {
    title: "WEPLN 💍 설레는 결혼 준비, 나만의 웨딩플래너",
    description: "당신의 가장 빛나는 순간을 위한 스마트 플래너예요 ✨ 복잡한 예산 관리부터 꼼꼼한 일정 체크까지, WEPLN과 함께 편안하고 행복하게 준비해 보세요 💖",
    url: "https://wepln.com",
    siteName: "WEPLN",
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
    title: "WEPLN 💍 설레는 결혼 준비, 나만의 웨딩플래너",
    description: "당신의 가장 빛나는 순간을 위한 스마트 플래너예요 ✨ 복잡한 예산 관리부터 꼼꼼한 일정 체크까지, WEPLN과 함께 편안하고 행복하게 준비해 보세요 💖",
    // opengraph-image.tsx가 자동으로 이미지를 생성합니다
  },
  verification: {
    google: "구글과 네이버 서치콘솔에서 발급받은 코드를 여기에 입력하세요", // TODO: Replace with actual Google verification code
    other: {
      "naver-site-verification": ["네이버 서치어드바이저 코드를 여기에 입력하세요"] // TODO: Replace with actual Naver verification code
    }
  }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "WEPLN",
              "alternateName": "위플랜",
              "url": "https://wepln.com",
              "logo": "https://wepln.com/opengraph-image",
              "sameAs": [
                "https://instagram.com/wepln_for_all"
              ],
              "description": "설레는 결혼 준비, 나만의 모바일 웨딩플래너. 일정, 예산, 체크리스트, AI 업체 추천을 커플이 함께 관리합니다."
            })
          }}
        />
        <InAppBrowserBlocker />
        <AnalyticsTracker />
        <SessionGuard />
        {children}
      </body>
    </html>
  )
}
