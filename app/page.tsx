'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ArrowRight, ChevronDown, CalendarHeart, CheckSquare, PiggyBank, Store, Heart, Flower2 } from 'lucide-react'
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
    <div className="landing font-sans">

      {/* ─── Navigation ─── */}
      <nav className={cn("landing-nav", scrolled && "scrolled")}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold no-underline transition-colors hover:opacity-80">
            <Flower2 className="text-[#FB7185]" size={22} />
            <span className={cn(scrolled ? "text-rose-900" : "text-rose-900")}>Wepln</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="landing-btn landing-btn--primary py-2 px-6 text-xs md:text-sm shadow-lg">
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="landing-hero" id="hero">
        <Particles className="absolute inset-0 z-[1] opacity-70" quantity={40} />

        <div className="landing-hero__overlay"></div>

        {/* Decorative floral SVG elements */}
        <div className="absolute top-10 left-10 w-32 h-32 opacity-10 z-[1]">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="20" fill="#FB7185" opacity="0.3" />
            <circle cx="30" cy="35" r="12" fill="#FDA4AF" opacity="0.2" />
            <circle cx="70" cy="35" r="12" fill="#FDA4AF" opacity="0.2" />
            <circle cx="30" cy="65" r="12" fill="#FECDD3" opacity="0.2" />
            <circle cx="70" cy="65" r="12" fill="#FECDD3" opacity="0.2" />
          </svg>
        </div>
        <div className="absolute bottom-20 right-10 w-40 h-40 opacity-10 z-[1]">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="25" fill="#D4A373" opacity="0.15" />
            <circle cx="50" cy="50" r="40" stroke="#D4A373" strokeWidth="0.5" opacity="0.2" />
          </svg>
        </div>

        <div className="relative z-[3] text-center px-6 max-w-[800px] animate-in fade-in zoom-in-95 duration-1000">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-400/10 border border-rose-300/30 text-rose-500 text-sm font-medium mb-8 backdrop-blur-sm">
            <Flower2 size={14} />
            <span>웨딩 플래너의 새로운 기준</span>
          </div>

          <h1 className="landing-hero__title font-serif">
            <span className="block mb-2">당신의 가장</span>
            <span className="landing-hero__title-accent">아름다운 순간</span>
            <span className="block mt-2">을 계획하세요</span>
          </h1>

          <p className="text-lg md:text-xl text-rose-900/60 mb-10 leading-relaxed">
            복잡한 결혼 준비, <strong className="text-rose-500">Wepln</strong> 하나로 끝내세요.<br className="hidden md:block" />
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
              <span className="block text-3xl font-bold text-rose-900 mb-1">1,200+</span>
              <span className="text-xs text-rose-400 uppercase tracking-widest">커플 이용</span>
            </div>
            <div className="w-px h-8 bg-rose-200"></div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-rose-900 mb-1">98%</span>
              <span className="text-xs text-rose-400 uppercase tracking-widest">만족도</span>
            </div>
            <div className="w-px h-8 bg-rose-200"></div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-rose-900 mb-1">500+</span>
              <span className="text-xs text-rose-400 uppercase tracking-widest">업체 정보</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] w-6 h-10 border-2 border-rose-300/40 rounded-full flex justify-center pt-2">
          <div className="landing-hero__scroll-dot"></div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-24 bg-white relative" id="features">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-rose-300/10 rounded-full blur-3xl -translate-y-1/2"></div>

        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-[3px] text-rose-400 uppercase mb-4 px-4 py-1.5 rounded-full bg-rose-50">Features</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-rose-900 mb-4 tracking-tight">결혼 준비,<br className="md:hidden" /> 이렇게 쉬웠나요?</h2>
            <p className="text-rose-400">Wepln이 제공하는 핵심 기능을 소개합니다.</p>
          </div>

          <div className="landing-features__grid">
            {/* Card 1 */}
            <div className="landing-feature-card group">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-400 mx-auto mb-5 group-hover:scale-110 transition-transform">
                <CalendarHeart size={28} />
              </div>
              <h3 className="text-lg font-bold text-rose-900 mb-3">일정 관리</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                D-Day 기반 스마트 캘린더로<br />중요한 일정을 놓치지 마세요.
              </p>
              <span className="inline-block px-3 py-1 bg-rose-50 rounded-full text-[10px] uppercase font-bold text-rose-300">Calendar</span>
            </div>

            {/* Card 2 */}
            <div className="landing-feature-card group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-5 group-hover:scale-110 transition-transform">
                <CheckSquare size={28} />
              </div>
              <h3 className="text-lg font-bold text-rose-900 mb-3">체크리스트</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                결혼 준비 필수 항목을<br />체계적으로 관리하세요.
              </p>
              <span className="inline-block px-3 py-1 bg-emerald-50 rounded-full text-[10px] uppercase font-bold text-emerald-300">To-Do</span>
            </div>

            {/* Card 3 */}
            <div className="landing-feature-card group">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mx-auto mb-5 group-hover:scale-110 transition-transform">
                <PiggyBank size={28} />
              </div>
              <h3 className="text-lg font-bold text-rose-900 mb-3">예산 관리</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                예상 비용을 한눈에 확인하고<br />효율적으로 관리하세요.
              </p>
              <span className="inline-block px-3 py-1 bg-amber-50 rounded-full text-[10px] uppercase font-bold text-amber-300">Budget</span>
            </div>

            {/* Card 4 */}
            <div className="landing-feature-card group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-500 mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Store size={28} />
              </div>
              <h3 className="text-lg font-bold text-rose-900 mb-3">업체 분석</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                예식장, 스튜디오, 드레스 등<br />최적의 업체를 찾아보세요.
              </p>
              <span className="inline-block px-3 py-1 bg-cyan-50 rounded-full text-[10px] uppercase font-bold text-cyan-300">Vendors</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section className="landing-steps" id="steps">
        <div className="landing-steps__container">
          <div className="landing-steps__header">
            <span className="landing-steps__tag">HOW IT WORKS</span>
            <h2 className="landing-steps__title font-serif">3단계로 시작하세요</h2>
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
          <h2 className="landing-cta__title font-serif">
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

      {/* ─── Footer ─── */}
      <footer className="py-6 px-6 bg-rose-50 border-t border-rose-100">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 text-rose-900">
            <Flower2 size={14} className="text-rose-400" />
            <span className="font-serif font-semibold text-[1.1rem]">Wepln</span>
          </div>
          <p className="text-xs text-rose-300">© 2026 Wepln Corporation. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
