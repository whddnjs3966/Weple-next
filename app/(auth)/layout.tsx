import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 · 회원가입',
  description: '카카오, 네이버, 구글 간편 로그인으로 WEPLN 웨딩플래너를 무료로 시작하세요. 결혼 준비 일정, 예산, 체크리스트를 커플이 함께 관리합니다.',
  keywords: ['웨딩플래너 로그인', '결혼준비 앱', '무료 웨딩플래너', '위플랜 가입'],
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
