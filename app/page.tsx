'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, ChevronDown, CalendarHeart, CheckSquare,
  PiggyBank, Heart, Sparkles, Users, Zap, Bot,
} from 'lucide-react'
import Particles from '@/components/Particles'

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false })

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        setTilt({ x: -y * 12, y: x * 12, active: true })
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0, active: false })}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.active ? 1.018 : 1})`,
        transition: tilt.active ? 'transform 0.08s ease' : 'transform 0.55s cubic-bezier(0.16,1,0.3,1)',
      }}
      className={className}
    >
      {children}
    </div>
  )
}

/* ─── Main Page ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [aurora, setAurora] = useState({ x: 40, y: 40 })
  const heroRef = useRef<HTMLElement>(null)

  // Drag-to-scroll (Pain Points 카드)
  const sliderRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 })

  const onDragStart = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    drag.current = { active: true, startX: e.pageX - sliderRef.current.offsetLeft, scrollLeft: sliderRef.current.scrollLeft }
    sliderRef.current.style.cursor = 'grabbing'
    sliderRef.current.style.userSelect = 'none'
  }

  const onDragMove = (e: React.MouseEvent) => {
    if (!drag.current.active || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    sliderRef.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX) * 1.4
  }

  const onDragEnd = () => {
    drag.current.active = false
    if (!sliderRef.current) return
    sliderRef.current.style.cursor = 'grab'
    sliderRef.current.style.userSelect = ''
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing-dark font-sans">

      {/* ══════════════════════════════════
          NAV
      ══════════════════════════════════ */}
      <nav className={`landing-dark-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#B8845A] flex items-center justify-center shadow-[0_0_18px_rgba(212,163,115,0.35)] group-hover:shadow-[0_0_28px_rgba(212,163,115,0.55)] transition-all duration-300">
              <Heart size={14} className="text-white fill-white" />
            </div>
            <span className="text-white font-serif text-xl font-bold tracking-tight">Wepln</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4A373] to-[#B8845A] text-white text-sm font-semibold hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(212,163,115,0.35)] transition-all duration-200"
          >
            시작하기 <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section
        ref={heroRef}
        id="hero"
        className="landing-dark-hero"
        onMouseMove={(e) => {
          if (!heroRef.current) return
          const r = heroRef.current.getBoundingClientRect()
          setAurora({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          })
        }}
      >
        {/* Aurora gradient — follows mouse */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 700px 500px at ${aurora.x * 0.5 + 12}% ${aurora.y * 0.5 + 8}%, rgba(139,92,246,0.16) 0%, transparent 65%),
              radial-gradient(ellipse 550px 400px at ${92 - aurora.x * 0.3}% ${85 - aurora.y * 0.3}%, rgba(212,163,115,0.13) 0%, transparent 60%)
            `,
            transition: 'background 0.6s ease',
          }}
        />

        {/* Star particles */}
        <Particles className="absolute inset-0 z-[1] opacity-50" quantity={75} />

        {/* Content */}
        <div className="relative z-[3] flex flex-col items-center text-center px-5 w-full max-w-4xl mx-auto pt-24 pb-16">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[#D4A373] text-xs font-semibold mb-8 tracking-widest backdrop-blur-sm">
            <Sparkles size={11} /> AI 웨딩 플래너
          </span>

          {/* Headline */}
          <h1 className="text-[clamp(2.4rem,5.8vw,4.4rem)] font-bold text-white leading-[1.16] mb-5 tracking-[-1.5px]">
            결혼 준비, 이제<br />
            <span className="bg-gradient-to-r from-[#D4A373] via-[#EDD5A3] to-[#A78BFA] bg-clip-text text-transparent">
              AI가 함께합니다
            </span>
          </h1>

          <p className="text-white/45 text-base sm:text-lg mb-10 leading-relaxed">
            일정·예산·업체·체크리스트를 커플이 함께, 한 곳에서.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-16">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4A373] to-[#B8845A] text-white font-semibold text-sm shadow-[0_0_40px_rgba(212,163,115,0.28)] hover:shadow-[0_0_60px_rgba(212,163,115,0.44)] hover:-translate-y-1 transition-all duration-300"
            >
              무료로 시작하기 <ArrowRight size={15} />
            </Link>
            <Link
              href="#features"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:border-white/25 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              기능 살펴보기 <ChevronDown size={15} />
            </Link>
          </div>

          {/* Floating Dashboard Mockup */}
          <TiltCard className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              <span className="ml-2 text-white/20 text-[10px] font-mono">wepln.app — 대시보드</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {/* D-Day */}
              <div className="col-span-2 rounded-xl bg-gradient-to-r from-[#A78BFA]/10 to-[#D4A373]/10 border border-white/[0.05] p-4 flex items-center justify-between">
                <div>
                  <div className="text-white/30 text-[10px] mb-0.5">결혼식까지</div>
                  <div className="text-5xl font-bold text-white font-cinzel leading-none">D-147</div>
                </div>
                <div className="text-right">
                  <div className="text-[#D4A373] text-[10px] font-medium">2026.07.04 (토)</div>
                  <div className="text-white/20 text-[9px] mt-0.5">서울 강남구 그랜드홀</div>
                </div>
              </div>
              {/* Checklist mini */}
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="text-white/30 text-[10px] mb-2.5">체크리스트</div>
                <div className="space-y-1.5">
                  {[
                    { t: '예식장 계약', done: true },
                    { t: '스드메 예약', done: true },
                    { t: '청첩장 제작', done: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-full border flex-shrink-0 flex items-center justify-center ${item.done ? 'border-[#A7C4A0] bg-[#A7C4A0]/20' : 'border-white/15'}`}>
                        {item.done && <div className="w-1.5 h-1.5 rounded-full bg-[#A7C4A0]" />}
                      </div>
                      <span className={`text-[9px] ${item.done ? 'text-white/25 line-through' : 'text-white/60'}`}>{item.t}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Budget mini */}
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="text-white/30 text-[10px] mb-1.5">예산 현황</div>
                <div className="text-xl font-bold text-white leading-none">
                  2,400<span className="text-[9px] font-normal text-white/30 ml-0.5">만원</span>
                </div>
                <div className="text-[9px] text-white/20 mb-2">/ 5,000만원</div>
                <div className="h-1.5 rounded-full bg-white/[0.08]">
                  <div className="h-full w-[48%] rounded-full bg-gradient-to-r from-[#D4A373] to-[#EDD5A3]" />
                </div>
                <div className="text-[9px] text-[#D4A373]/60 mt-1">48% 사용</div>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3]">
          <ChevronDown size={18} className="text-white/20 animate-bounce" />
        </div>
      </section>

      {/* ══════════════════════════════════
          BENTO FEATURES
      ══════════════════════════════════ */}
      <section className="py-24 px-5 bg-[#0A0A14]" id="features">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <span className="inline-block text-[10px] font-bold tracking-[3px] text-[#D4A373] uppercase mb-4 px-4 py-1.5 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/20">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              결혼 준비의 모든 것,<br className="sm:hidden" /> Wepln 하나로
            </h2>
            <p className="text-white/35 text-sm">핵심 기능을 카드로 살펴보세요.</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:auto-rows-[210px]">

            {/* 1. 일정 & D-Day  — lg: row-span-2 */}
            <TiltCard className="landing-bento-card lg:row-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/15 flex items-center justify-center">
                    <CalendarHeart size={15} className="text-[#A78BFA]" />
                  </div>
                  <span className="text-white/50 text-sm">일정 & D-Day</span>
                </div>
                <div className="text-[4.5rem] font-bold text-white font-cinzel leading-none mb-1">
                  D-247
                </div>
                <div className="text-white/22 text-xs">결혼식까지 남은 날</div>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: '웨딩홀 투어', date: '3월 15일', color: '#A78BFA' },
                  { label: '드레스 피팅', date: '4월 02일', color: '#D4A373' },
                  { label: '청첩장 발송', date: '5월 10일', color: '#60A5FA' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-white/55">{s.label}</span>
                    </div>
                    <span className="text-white/25 text-[10px]">{s.date}</span>
                  </div>
                ))}
              </div>
            </TiltCard>

            {/* 2. 체크리스트 */}
            <TiltCard className="landing-bento-card flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#A7C4A0]/15 flex items-center justify-center">
                  <CheckSquare size={15} className="text-[#A7C4A0]" />
                </div>
                <span className="text-white/50 text-sm">체크리스트</span>
              </div>
              <div className="space-y-2 flex-1">
                {[
                  { l: '예식장 계약', done: true },
                  { l: '스드메 예약', done: true },
                  { l: '청첩장 제작', done: false },
                  { l: '신혼여행 예약', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${item.done ? 'border-[#A7C4A0] bg-[#A7C4A0]/20' : 'border-white/15'}`}>
                      {item.done && <div className="w-1.5 h-1.5 rounded-full bg-[#A7C4A0]" />}
                    </div>
                    <span className={`text-xs ${item.done ? 'text-white/22 line-through' : 'text-white/65'}`}>{item.l}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[9px] text-white/25 mb-1">
                  <span>진행률</span><span>50%</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.07]">
                  <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#A7C4A0] to-[#6BAE68]" />
                </div>
              </div>
            </TiltCard>

            {/* 3. 예산 관리 */}
            <TiltCard className="landing-bento-card flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#D4A373]/15 flex items-center justify-center">
                  <PiggyBank size={15} className="text-[#D4A373]" />
                </div>
                <span className="text-white/50 text-sm">예산 관리</span>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white leading-none mb-0.5">
                  2,400<span className="text-xs font-normal text-white/30 ml-0.5">만원</span>
                </div>
                <div className="text-[9px] text-white/22 mb-3">총 예산 5,000만원 중 사용</div>
                <div className="space-y-1.5">
                  {[
                    { l: '웨딩홀', p: 52, c: '#D4A373' },
                    { l: '스드메', p: 22, c: '#A78BFA' },
                    { l: '신혼여행', p: 18, c: '#60A5FA' },
                    { l: '기타', p: 8, c: '#A7C4A0' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.c }} />
                      <div className="flex-1 h-1 rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full" style={{ width: `${b.p}%`, background: b.c }} />
                      </div>
                      <span className="text-[9px] text-white/22 w-5 text-right">{b.p}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>

            {/* 4. AI 업체 추천 */}
            <TiltCard className="landing-bento-card flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/15 flex items-center justify-center">
                  <Bot size={15} className="text-[#60A5FA]" />
                </div>
                <span className="text-white/50 text-sm">AI 업체 추천</span>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-[#60A5FA]/10 text-[#60A5FA] text-[9px] font-bold tracking-wider">AI</span>
              </div>
              <div className="space-y-2 flex-1">
                {[
                  { name: '그랜드 워커힐 서울', tag: '웨딩홀', score: '98점', color: '#60A5FA' },
                  { name: '스냅 스튜디오 강남', tag: '스튜디오', score: '95점', color: '#A78BFA' },
                ].map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.05] hover:border-[#60A5FA]/20 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${v.color}22, ${v.color}0A)` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white/75 text-xs font-medium truncate">{v.name}</div>
                      <div className="text-white/25 text-[9px]">{v.tag}</div>
                    </div>
                    <div className="text-[10px] font-bold flex-shrink-0" style={{ color: v.color }}>{v.score}</div>
                  </div>
                ))}
                <div className="text-center text-white/18 text-[9px] pt-1">예산·위치·스타일 기반 맞춤 추천</div>
              </div>
            </TiltCard>

            {/* 5. 커플 공유 */}
            <TiltCard className="landing-bento-card flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F9A8D4]/15 flex items-center justify-center">
                  <Users size={15} className="text-[#F9A8D4]" />
                </div>
                <span className="text-white/50 text-sm">커플 공유</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F9A8D4] to-[#F472B6] flex items-center justify-center text-2xl shadow-[0_0_18px_rgba(249,168,212,0.28)]">
                      👩
                    </div>
                    <span className="text-white/28 text-[9px]">신부</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Heart size={14} className="text-[#F9A8D4] fill-[#F9A8D4] animate-pulse" />
                    <span className="text-[8px] text-white/18">실시간 공유</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-2xl shadow-[0_0_18px_rgba(167,139,250,0.28)]">
                      👨
                    </div>
                    <span className="text-white/28 text-[9px]">신랑</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-white/20 text-[9px] mt-3 leading-relaxed">
                초대 코드 하나로 연결,<br />체크리스트·일정·예산 모두 공유
              </div>
            </TiltCard>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PAIN POINTS — 이런 고민, 있으신가요?
      ══════════════════════════════════ */}
      <section className="py-24 bg-[#07070F]" id="stories">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 px-5">
            <span className="inline-block text-[10px] font-bold tracking-[3px] text-[#A78BFA] uppercase mb-4 px-4 py-1.5 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20">
              이런 커플에게 딱
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">이런 고민, 있으신가요?</h2>
          </div>

          {/* Horizontal scroll — drag & snap */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-5 scrollbar-hidden snap-x snap-mandatory px-5 select-none"
            style={{ cursor: 'grab', scrollBehavior: 'auto' }}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
          >
            {[
              {
                emoji: '😰',
                q: '결혼식까지 6개월도 안 남았는데 뭐부터 해야 할지 모르겠어요.',
                a: 'D-Day 기반 맞춤 체크리스트 자동 생성',
                c: '#A78BFA',
              },
              {
                emoji: '💸',
                q: '예산을 항목별로 어떻게 나눠야 할지 감이 안 와요.',
                a: 'AI가 예산 배분 플랜을 자동으로 설계',
                c: '#D4A373',
              },
              {
                emoji: '💑',
                q: '파트너와 준비 현황을 실시간으로 같이 보고 싶어요.',
                a: '초대 코드 하나로 모든 정보 커플 공유',
                c: '#F9A8D4',
              },
              {
                emoji: '🏛️',
                q: '어떤 웨딩홀, 스튜디오를 골라야 할지 막막해요.',
                a: 'AI가 위치·예산·스타일 기반으로 추천',
                c: '#60A5FA',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="flex-none w-[270px] sm:w-[295px] snap-start rounded-2xl border border-white/[0.07] p-6 flex flex-col gap-4 pointer-events-none"
                style={{
                  background: `linear-gradient(145deg, ${card.c}12 0%, rgba(7,7,15,0.85) 100%)`,
                }}
              >
                <span className="text-4xl">{card.emoji}</span>
                <p className="text-white/52 text-sm leading-relaxed flex-1">"{card.q}"</p>
                <div className="flex items-start gap-2 pt-4 border-t border-white/[0.06]">
                  <Zap size={11} className="mt-0.5 flex-shrink-0" style={{ color: card.c }} />
                  <span className="text-xs font-semibold leading-relaxed" style={{ color: card.c }}>{card.a}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════ */}
      <section className="py-24 px-5 bg-[#0A0A14]" id="steps">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[10px] font-bold tracking-[3px] text-[#D4A373] uppercase mb-4 px-4 py-1.5 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/20">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">3단계로 시작하세요</h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[27px] top-7 bottom-7 w-px bg-gradient-to-b from-[#A78BFA] via-[#D4A373] to-[#60A5FA] opacity-18 hidden sm:block" />
            <div className="space-y-10">
              {[
                {
                  n: '01',
                  title: '가입 & 날짜 설정',
                  desc: '결혼 예정일, 예산, 스타일을 입력하면 AI가 맞춤 준비 플랜을 자동으로 만들어드려요.',
                  c: '#A78BFA',
                },
                {
                  n: '02',
                  title: '커플 코드로 연결',
                  desc: '파트너에게 초대 코드를 공유하면 체크리스트, 일정, 예산이 실시간으로 함께 공유돼요.',
                  c: '#D4A373',
                },
                {
                  n: '03',
                  title: 'AI와 함께 준비 완료',
                  desc: '업체 추천부터 예산 배분, 일정 관리까지 — AI가 옆에서 빠짐없이 도와드려요.',
                  c: '#60A5FA',
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-5 sm:gap-8 items-start relative z-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm font-cinzel flex-shrink-0"
                    style={{
                      background: `${step.c}18`,
                      border: `1px solid ${step.c}35`,
                      color: step.c,
                    }}
                  >
                    {step.n}
                  </div>
                  <div className="pt-3">
                    <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{step.title}</h3>
                    <p className="text-white/38 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA
      ══════════════════════════════════ */}
      <section className="relative py-32 px-5 bg-[#07070F] overflow-hidden">
        {/* Glow orbs */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(212,163,115,0.11) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(167,139,250,0.09) 0%, transparent 65%)' }}
        />

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight leading-[1.15]">
            지금 시작하면<br />
            <span className="bg-gradient-to-r from-[#D4A373] via-[#EDD5A3] to-[#D4A373] bg-clip-text text-transparent">
              결혼 준비가 달라집니다
            </span>
          </h2>
          <p className="text-white/32 mb-10 leading-relaxed text-sm">
            AI가 설계하고, 커플이 함께 만들어가는<br />새로운 웨딩 플래너를 경험해보세요.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-white text-base shadow-[0_0_50px_rgba(212,163,115,0.26)] hover:shadow-[0_0_70px_rgba(212,163,115,0.44)] hover:-translate-y-1 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #D4A373 0%, #C9956B 50%, #D4A373 100%)' }}
          >
            무료로 시작하기 <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer
        className="py-8 px-5 border-t"
        style={{ background: '#050508', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#D4A373] to-[#B8845A] flex items-center justify-center">
              <Heart size={11} className="text-white fill-white" />
            </div>
            <span className="text-white/45 font-serif font-semibold">Wepln</span>
          </div>
          <p className="text-white/18 text-xs">© 2026 Wepln. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
