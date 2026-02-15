'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ArrowRight, ChevronDown, CalendarHeart, CheckSquare, PiggyBank, Store, Heart } from 'lucide-react'
import Particles from '@/components/Particles'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="landing font-sans text-gray-900">

      {/* ─── Navigation ─── */}
      <nav className={cn("landing-nav", scrolled && "scrolled")}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-serif text-2xl font-bold no-underline transition-colors hover:opacity-80">
            <Heart className="text-[#FF8E8E] fill-[#FF8E8E]" size={20} />
            <span className={cn(scrolled ? "text-gray-900" : "text-white")}>Wepln</span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Login Button Removed as per request */}
            <Link href="/login" className="landing-btn landing-btn--primary py-2 px-6 text-xs md:text-sm shadow-lg shadow-primary/30">
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="landing-hero" id="hero">
        <Particles className="absolute inset-0 z-[1] opacity-60" quantity={70} />

        <div className="landing-hero__overlay"></div>

        <div className="relative z-[3] text-center px-6 max-w-[800px] animate-in fade-in zoom-in-95 duration-1000">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF8E8E]/15 border border-[#FF8E8E]/30 text-[#FFB5B5] text-sm font-medium mb-8 backdrop-blur-md">
            <Heart size={14} className="fill-current" />
            <span>웨딩 플래너의 새로운 기준</span>
          </div>

          <h1 className="landing-hero__title">
            <span className="block mb-2">당신의 가장</span>
            <span className="landing-hero__title-accent">아름다운 순간</span>
            <span className="block mt-2">을 계획하세요</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed">
            복잡한 결혼 준비, <strong>Wepln</strong> 하나로 끝내세요.<br className="hidden md:block" />
            일정 관리부터 예산, 업체 선정까지 완벽하게.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/login" className="landing-btn landing-btn--primary">
              <span>무료로 시작하기</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="#features" className="landing-btn landing-btn--ghost">
              <span>더 알아보기</span>
              <ChevronDown size={16} />
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            <div className="text-center">
              <span className="block text-3xl font-bold text-white mb-1">1,200+</span>
              <span className="text-xs text-white/50 uppercase tracking-widest">커플 이용</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-white mb-1">98%</span>
              <span className="text-xs text-white/50 uppercase tracking-widest">만족도</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-white mb-1">500+</span>
              <span className="text-xs text-white/50 uppercase tracking-widest">업체 정보</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="landing-hero__scroll-dot"></div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-24 bg-white relative" id="features">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[#FF8E8E]/10 rounded-full blur-3xl -translate-y-1/2"></div>

        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-[3px] text-[#FF8E8E] uppercase mb-4 px-4 py-1.5 rounded-full bg-[#FF8E8E]/10">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">결혼 준비,<br className="md:hidden" /> 이렇게 쉬웠나요?</h2>
            <p className="text-gray-500">Wepln이 제공하는 핵심 기능을 소개합니다.</p>
          </div>

          <div className="landing-features__grid">
            {/* Card 1 */}
            <div className="landing-feature-card group">
              <div className="w-14 h-14 rounded-2xl bg-[#FF8E8E]/10 flex items-center justify-center text-[#FF8E8E] mx-auto mb-5 group-hover:scale-110 transition-transform">
                <CalendarHeart size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">일정 관리</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                D-Day 기반 스마트 캘린더로<br />중요한 일정을 놓치지 마세요.
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[10px] uppercase font-bold text-gray-400">Calendar</span>
            </div>

            {/* Card 2 */}
            <div className="landing-feature-card group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-5 group-hover:scale-110 transition-transform">
                <CheckSquare size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">체크리스트</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                결혼 준비 필수 항목을<br />체계적으로 관리하세요.
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[10px] uppercase font-bold text-gray-400">To-Do</span>
            </div>

            {/* Card 3 */}
            <div className="landing-feature-card group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto mb-5 group-hover:scale-110 transition-transform">
                <PiggyBank size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">예산 관리</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                예상 비용을 한눈에 확인하고<br />효율적으로 관리하세요.
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[10px] uppercase font-bold text-gray-400">Budget</span>
            </div>

            {/* Card 4 */}
            <div className="landing-feature-card group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Store size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">업체 분석</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                예식장, 스튜디오, 드레스 등<br />최적의 업체를 찾아보세요.
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[10px] uppercase font-bold text-gray-400">Vendors</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section className="landing-steps" id="steps">
        <div className="landing-steps__container">
          <div className="landing-steps__header">
            <span className="landing-steps__tag">HOW IT WORKS</span>
            <h2 className="landing-steps__title">3단계로 시작하세요</h2>
          </div>

          <div className="landing-steps__timeline">
            <div className="landing-step">
              <div className="landing-step__number">01</div>
              <div className="landing-step__content">
                <h3>회원가입</h3>
                <p>네이버 또는 간편 가입으로<br />30초만에 시작하세요.</p>
              </div>
            </div>

            <div className="landing-step__connector"></div>

            <div className="landing-step">
              <div className="landing-step__number">02</div>
              <div className="landing-step__content">
                <h3>결혼일 설정</h3>
                <p>결혼 예정일을 입력하면<br />D-Day 기반 플랜이 생성돼요.</p>
              </div>
            </div>

            <div className="landing-step__connector"></div>

            <div className="landing-step">
              <div className="landing-step__number">03</div>
              <div className="landing-step__content">
                <h3>준비 시작</h3>
                <p>체크리스트, 일정, 업체 분석까지<br />모든 준비를 한 곳에서.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="landing-cta" id="cta">
        <div className="landing-cta__container">
          <div className="landing-cta__glow"></div>
          <h2 className="landing-cta__title">
            지금 바로,<br />
            <span>완벽한 웨딩 플랜</span>을 시작하세요.
          </h2>
          <p className="landing-cta__desc">
            이미 많은 커플이 Wepln과 함께<br />
            행복한 결혼 준비를 하고 있어요.
          </p>
          <Link href="/login" className="landing-btn landing-btn--white">
            <span>무료로 시작하기</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ─── Footer (Django Dark Style) ─── */}
      <footer className="py-6 px-6" style={{ background: '#1a1a2e', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 text-white">
            <Heart size={14} className="fill-[#FF8E8E] text-[#FF8E8E]" />
            <span className="font-serif font-semibold text-[1.1rem]">Wepln</span>
          </div>
          <p className="text-xs text-white/30">© 2026 Wepln Corporation. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
