'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

/* ─────────────────────────────────────────────
   Star Sparkle — 4-pointed cross-star with glow
   ───────────────────────────────────────────── */
function StarSparkle({ delay = 0, className }: { delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
      animate={{
        opacity: [0, 1, 0.6, 1, 0],
        scale: [0.3, 1.2, 0.9, 1.1, 0.3],
        rotate: [0, 45, 90],
      }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
      className={clsx('absolute pointer-events-none flex items-center justify-center', className)}
    >
      {/* Glow halo */}
      <div className="absolute inset-[-4px] bg-current rounded-full blur-[8px] opacity-30" />
      {/* Vertical beam */}
      <div className="absolute w-[1px] h-[160%] bg-gradient-to-b from-transparent via-current to-transparent opacity-90" />
      {/* Horizontal beam */}
      <div className="absolute h-[1px] w-[160%] bg-gradient-to-r from-transparent via-current to-transparent opacity-90" />
      {/* Diagonal beams for 8-pointed effect */}
      <div className="absolute w-[1px] h-[110%] bg-gradient-to-b from-transparent via-current to-transparent opacity-50 rotate-45" />
      <div className="absolute w-[1px] h-[110%] bg-gradient-to-b from-transparent via-current to-transparent opacity-50 -rotate-45" />
      {/* Center bright dot */}
      <div className="absolute w-[3px] h-[3px] bg-white rounded-full shadow-[0_0_10px_currentColor,0_0_20px_currentColor]" />
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Diamond Sparkle — smaller, faster twinkle
   ───────────────────────────────────────────── */
function DiamondSparkle({ delay = 0, className }: { delay?: number; className?: string }) {
  return (
    <motion.div
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.5],
        rotate: [0, 180],
      }}
      transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeInOut' }}
      className={clsx('absolute pointer-events-none', className)}
    >
      <div className="w-full h-full bg-current rotate-45 opacity-80" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      <div className="absolute inset-0 bg-current rounded-full blur-[3px] opacity-40" />
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Global Background Sparkles & Bokeh
   ───────────────────────────────────────────── */
function Sparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft ambient gradients */}
      <div className="absolute top-0 right-0 w-[50%] h-[70%] bg-gradient-to-bl from-amber-50/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-rose-50/60 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-gradient-to-br from-amber-50/30 to-rose-50/20 rounded-full blur-[100px]" />

      {/* Bokeh Lights */}
      {[
        { t: '15%', r: '10%', s: '120px', o: '0.35', d: 0, b: 'blur-md', c: 'bg-amber-100/60' },
        { t: '25%', r: '25%', s: '80px', o: '0.2', d: 2, b: 'blur-sm', c: 'bg-rose-100/50' },
        { t: '45%', l: '15%', s: '150px', o: '0.25', d: 1, b: 'blur-lg', c: 'bg-white' },
        { t: '60%', r: '15%', s: '100px', o: '0.4', d: 3, b: 'blur-md', c: 'bg-amber-50/70' },
        { t: '80%', l: '20%', s: '90px', o: '0.3', d: 4, b: 'blur-sm', c: 'bg-rose-50/60' },
        { t: '35%', r: '5%', s: '180px', o: '0.15', d: 1.5, b: 'blur-xl', c: 'bg-white' },
      ].map((b, i) => (
        <motion.div
          key={`bokeh-${i}`}
          animate={{
            y: [0, -20, 0],
            opacity: [Number(b.o), Number(b.o) * 1.5, Number(b.o)],
          }}
          transition={{ duration: 7 + (i % 3), repeat: Infinity, delay: b.d }}
          className={clsx('absolute rounded-full', b.b, b.c)}
          style={{
            top: b.t,
            left: b.l,
            right: b.r,
            width: b.s,
            height: b.s,
            boxShadow: '0 0 40px rgba(255,255,255,0.8)',
          }}
        />
      ))}

      {/* Floating sparkle dots */}
      {[
        { t: '12%', l: '24%', d: 1 },
        { t: '82%', l: '75%', d: 4 },
        { t: '45%', l: '18%', d: 2 },
        { t: '23%', l: '88%', d: 5 },
        { t: '67%', l: '34%', d: 3 },
        { t: '90%', l: '12%', d: 1.5 },
        { t: '34%', l: '60%', d: 4.5 },
        { t: '15%', l: '85%', d: 2.5 },
        { t: '75%', l: '90%', d: 3.5 },
        { t: '55%', l: '45%', d: 0.5 },
      ].map((star, i) => (
        <motion.div
          key={`star-${i}`}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: star.d }}
          className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
          style={{
            top: star.t,
            left: star.l,
            boxShadow: '0 0 10px rgba(255, 255, 255, 1)',
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Shimmer Button component
   ───────────────────────────────────────────── */
function ShimmerButton({
  href,
  children,
  className,
  size = 'lg',
}: {
  href: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'lg'
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 rounded-full text-white font-bold transition-all hover:-translate-y-0.5 overflow-hidden group',
        size === 'lg'
          ? 'px-9 py-4 text-[16px] shadow-[0_8px_30px_rgba(190,155,123,0.35)]'
          : 'px-6 py-2.5 text-[14px] shadow-[0_4px_15px_rgba(190,155,123,0.3)]',
        className,
      )}
    >
      {/* Base gradient */}
      <span
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #D4B896 0%, #C4A07A 40%, #BA9776 70%, #B08A6A 100%)',
        }}
      />
      {/* Shimmer sweep */}
      <span className="absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 60%, transparent 80%)',
            animation: 'shimmer-sweep 2s ease-in-out infinite',
          }}
        />
      </span>
      {/* Warm glow on hover */}
      <span className="absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]" />
      <span className="relative z-[2]">{children}</span>
    </Link>
  )
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FCFAF6] font-sans text-gray-800 relative selection:bg-rose-200">

      {/* Shimmer keyframe */}
      <style jsx global>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Global Background Effects */}
      <Sparkles />

      {/* ══════════════════════════════════
          NAV
      ══════════════════════════════════ */}
      <nav
        className={clsx(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'py-6',
        )}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 relative z-10 w-[200px]">
            <span className="text-3xl font-serif text-[#BE9B7B]">Wepln</span>
          </Link>

          {/* Spacer for center alignment */}
          <div className="hidden md:flex flex-1" />

          <div className="hidden sm:flex justify-end w-[200px] relative">
            <ShimmerButton href="/login" size="sm">
              시작하기 {'>'}
            </ShimmerButton>
            <StarSparkle className="w-5 h-5 -top-2 -right-2 text-amber-300" delay={0.5} />
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════
          HERO — full viewport width image
      ══════════════════════════════════ */}
      <section
        id="hero"
        className="relative z-10 w-full min-h-screen overflow-hidden"
      >
        {/* Background Image — full bleed, edge-to-edge */}
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        >
          <Image
            src="/images/landing_bg.png"
            alt="Wedding scene"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />

          {/* Soft golden vignette for warmth */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/15 via-transparent to-rose-50/10" />

          {/* Left content overlay — readable text area */}
          <div className="absolute top-0 left-0 bottom-0 w-full lg:w-[55%] bg-gradient-to-r from-[#FCFAF6] via-[#FCFAF6]/85 to-transparent" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-[#FCFAF6] via-[#FCFAF6]/70 to-transparent" />
          {/* Top fade for nav readability */}
          <div className="absolute top-0 left-0 right-0 h-[12%] bg-gradient-to-b from-[#FCFAF6]/60 to-transparent" />

          {/* Floating sparkles on the image */}
          <StarSparkle className="w-14 h-14 top-[15%] left-[60%] text-amber-200/70" delay={1} />
          <StarSparkle className="w-10 h-10 bottom-[25%] right-[8%] text-rose-200/60" delay={2.5} />
          <StarSparkle className="w-6 h-6 top-[50%] right-[30%] text-white/50" delay={4} />
          <DiamondSparkle className="w-4 h-4 top-[35%] right-[20%] text-amber-300/60" delay={3.5} />
          <DiamondSparkle className="w-3 h-3 bottom-[40%] right-[40%] text-rose-300/50" delay={1.8} />
        </motion.div>

        {/* Content — constrained width, overlaid on full-bleed image */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 pt-36 pb-20 lg:pt-44 lg:pb-32 flex items-center min-h-screen">
          <div className="flex-1 text-center lg:text-left max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-[2rem] sm:text-[3rem] lg:text-[4.5rem] font-bold text-gray-700 mb-6 tracking-tight leading-[1.15] whitespace-nowrap"
            >
              결혼 준비의 모든 것,
              <br />
              <span className="relative text-[#BA9776]">
                Wepln 하나로
                <DiamondSparkle className="w-3 h-3 -top-1 -right-4 text-amber-400" delay={1} />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-gray-600 text-[17px] sm:text-[20px] mb-12 leading-[1.6] break-keep font-semibold"
            >
              일정, 예산, 체크리스트, 업체 추천까지
              <br />
              <span className="text-[#E07A84]">커플이 함께 관리</span>하는 올인원 웨딩 플래너
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <div className="relative w-full sm:w-auto">
                <ShimmerButton href="/login" className="w-full sm:w-auto">
                  무료로 시작하기 {'>'}
                </ShimmerButton>
                <StarSparkle className="w-6 h-6 -top-3 -right-3 text-amber-200" delay={0.2} />
                <StarSparkle className="w-4 h-4 -bottom-1 -left-2 text-rose-200" delay={1.5} />
              </div>
              <Link
                href="#features"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-[#BA9776]/30 bg-white/50 text-gray-700 font-bold text-[16px] hover:bg-white/80 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
              >
                기능 살펴보기 <ChevronDown size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════ */}
      <section id="features" className="relative z-20 py-24">
        <div className="max-w-[900px] mx-auto px-5">
          <div className="text-center mb-10">
            <span className="text-[12px] font-bold tracking-[2px] text-[#BA9776] uppercase mb-2 block font-serif">
              FEATURES
            </span>
            <h2 className="text-3xl md:text-[2rem] font-bold text-gray-800 tracking-tight">
              어떤 기능이 있나요?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Card 1: Schedule & D-Day */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative group bg-gradient-to-br from-white/90 via-white/80 to-[#FCF4EE]/90 backdrop-blur-md rounded-[1.5rem] p-8 pb-10 border border-white/60 overflow-hidden"
              style={{
                boxShadow: '0 15px 40px rgba(0,0,0,0.04), 0 1px 2px rgba(186,151,118,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.5rem] bg-gradient-to-br from-amber-50/40 to-rose-50/20 pointer-events-none" />
              {/* Gold rim on hover */}
              <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(186,151,118,0.2)' }} />

              <StarSparkle className="w-6 h-6 top-6 right-6 text-amber-300" delay={0.3} />
              <DiamondSparkle className="w-3 h-3 top-16 right-16 text-amber-200" delay={2.5} />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="relative w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-50 to-white border border-amber-100/50 shadow-[0_2px_8px_rgba(208,170,132,0.15)]">
                  <span className="text-xl">🗓️</span>
                </div>
                <h3 className="text-[22px] font-bold text-gray-800">일정 & D-Day</h3>
              </div>

              <div className="flex flex-col items-center mt-2 mb-8 relative z-10">
                <div className="relative">
                  <div className="text-[3.8rem] font-bold text-[#D0AA84] mb-3 leading-none font-serif" style={{ textShadow: '0 2px 12px rgba(208,170,132,0.25)' }}>
                    D-247
                  </div>
                  {/* Subtle glow behind D-Day */}
                  <div className="absolute inset-0 -z-10 bg-amber-100/30 rounded-full blur-[25px] scale-150" />
                </div>
                <p className="text-[13px] text-gray-600 font-semibold text-center leading-[1.6] break-keep">
                  결혼식까지 남은 시간과
                  <br />
                  중요한 웨딩 일정을 한눈에 확인하세요.
                </p>
              </div>

              {/* Timeline */}
              <div className="mt-10 relative px-2 z-10">
                <div className="absolute top-[5px] left-6 right-6 h-[2px] bg-gradient-to-r from-rose-300/80 via-amber-300/80 to-rose-300/80" />
                <div className="flex justify-between relative z-10">
                  {[
                    { color: 'bg-rose-300', label: '웨딩홀 투어', date: '3월 15일' },
                    { color: 'bg-amber-300', label: '드레스 피팅', date: '4월 02일' },
                    { color: 'bg-rose-400', label: '청첩장 발송', date: '5월 10일' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className={clsx('w-3.5 h-3.5 rounded-full border-[2.5px] border-white shadow-sm mb-2', item.color)} style={{ boxShadow: '0 0 8px rgba(0,0,0,0.08)' }} />
                      <span className="text-[12px] font-bold text-gray-700">{item.label}</span>
                      <span className="text-[11px] text-gray-400 font-semibold">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative gradient blob */}
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-rose-100/40 rounded-full blur-[35px]" />
            </motion.div>

            {/* Card 2: Checklist */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative group bg-gradient-to-br from-white/90 via-white/80 to-[#FCF4EE]/90 backdrop-blur-md rounded-[1.5rem] p-8 border border-white/60 overflow-hidden"
              style={{
                boxShadow: '0 15px 40px rgba(0,0,0,0.04), 0 1px 2px rgba(186,151,118,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.5rem] bg-gradient-to-br from-rose-50/40 to-amber-50/20 pointer-events-none" />
              <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(186,151,118,0.2)' }} />

              <StarSparkle className="w-8 h-8 top-10 right-8 text-rose-300" delay={1.2} />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="relative w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-50 to-white border border-rose-100/50 shadow-[0_2px_8px_rgba(224,122,132,0.12)]">
                  <span className="text-xl">📋</span>
                </div>
                <h3 className="text-[22px] font-bold text-gray-800">체크리스트</h3>
              </div>

              <p className="text-[13px] text-gray-600 font-semibold mb-6 break-keep leading-[1.6] relative z-10">
                수많은 결혼 준비 항목,
                <br />
                꼼꼼하고 완벽하게 관리하세요.
              </p>

              {/* Progress Bar */}
              <div className="mb-6 relative z-10">
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '65%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #F0D6B8 0%, #D0AA84 60%, #C49A72 100%)',
                      boxShadow: '0 0 12px rgba(208,170,132,0.4)',
                    }}
                  />
                </div>
                <div
                  className="absolute top-[0px] left-[65%] w-[11px] h-[11px] bg-white rounded-full border-[2px] border-[#D0AA84] shadow-[0_0_8px_rgba(208,170,132,0.3)] -translate-x-1/2"
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-4 relative z-10 w-full">
                {[
                  { w: '80%', c: 'from-[#D0AA84] to-[#C49A72]' },
                  { w: '90%', c: 'from-amber-300 to-amber-400' },
                  { w: '70%', c: 'from-rose-300 to-rose-400' },
                  { w: '85%', c: 'from-pink-200 to-pink-300' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-white border-[1.5px] border-[#D0AA84] flex items-center justify-center flex-shrink-0 text-[#D0AA84] shadow-[0_1px_4px_rgba(208,170,132,0.15)]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div className={clsx('h-2.5 rounded-full bg-gradient-to-r', item.c)} style={{ width: item.w }} />
                  </motion.div>
                ))}
              </div>

              {/* Decorative gradient blob */}
              <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-amber-100/40 rounded-full blur-[35px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PAIN POINTS
      ══════════════════════════════════ */}
      <section id="stories" className="relative z-20 py-20">
        {/* Glow behind the section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[300px] bg-gradient-to-r from-amber-100/30 to-rose-100/30 blur-[80px] -z-10 rounded-full" />

        <div className="max-w-[1000px] mx-auto px-5">
          <div className="text-center mb-10">
            <span className="text-[12px] font-bold tracking-[2px] text-[#BA9776] uppercase mb-2 block font-serif">
              이런 커플에게 딱
            </span>
            <h2 className="text-3xl md:text-[2rem] font-bold text-gray-800 tracking-tight">
              이런 고민, 있으신가요?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Pain Point Cards */}
            {[
              {
                emoji: '🥺',
                pain: '"예식장은 잡았는데... 그 다음엔 뭐부터 해야 하죠? 놓치는 게 있을까봐 불안해요."',
                label: 'D-Day 기반 맞춤 체크리스트 자동 생성',
                sparklePos: 'top-8 left-8',
                sparkleColor: 'text-amber-200',
                sparkleDelay: 0.8,
              },
              {
                emoji: '👫',
                pain: '"나는 알고 있는데 파트너는 어디까지 알고 있을까요? 매번 공유하기가 너무 번거로워요."',
                label: '초대 코드 하나로 모든 정보 커플 공유',
                sparklePos: 'bottom-10 right-6',
                sparkleColor: 'text-rose-200',
                sparkleDelay: 2.1,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative group backdrop-blur-md rounded-[1.5rem] p-8 pb-10 text-center flex flex-col items-center overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,251,240,0.8) 100%)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.05), 0 1px 3px rgba(186,151,118,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.7)',
                }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.5rem] bg-gradient-to-br from-amber-50/30 to-rose-50/20 pointer-events-none" />
                <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(186,151,118,0.15)' }} />

                <StarSparkle className={clsx('w-6 h-6', item.sparklePos, item.sparkleColor)} delay={item.sparkleDelay} />

                <div className="text-[3rem] mb-4 relative z-10">{item.emoji}</div>
                <p className="text-gray-700 font-bold text-[15px] leading-relaxed mb-8 break-keep px-4 relative z-10">
                  {item.pain}
                </p>

                <div className="mt-auto relative z-10">
                  <p className="text-gray-600 font-bold text-[13px] mb-3">
                    Wepln 솔루션:
                  </p>
                  <div
                    className="relative inline-block px-6 py-2.5 rounded-full text-white font-bold text-[14px] overflow-hidden group/btn"
                    style={{
                      background: 'linear-gradient(135deg, #D4B896 0%, #C4A07A 40%, #BA9776 70%, #B08A6A 100%)',
                      boxShadow: '0 4px 15px rgba(190,155,123,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    {item.label}
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-tl from-amber-100/30 to-transparent rounded-full blur-[25px]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════ */}
      <section className="relative z-20 py-24 pb-32" id="steps">
        {/* Decorative background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-amber-50/40 to-rose-50/30 rounded-full blur-[100px] -z-10" />

        <div className="max-w-[700px] mx-auto px-5 text-center">
          <span className="text-[12px] font-bold tracking-[2px] text-[#BA9776] uppercase mb-2 block font-serif">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-20">3단계로 시작하세요</h2>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#C5A384]/30 to-transparent" />

            {[
              { n: '01', title: '가입 & 날짜 설정', desc: '간편 가입 후 웨딩 날짜를 설정하세요' },
              { n: '02', title: '커플 코드로 연결', desc: '파트너를 초대해 함께 준비해요' },
              { n: '03', title: '함께 준비 완료', desc: '체크리스트, 일정, 예산을 한눈에' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center w-full md:w-auto"
              >
                <div className="relative z-10 flex flex-col items-center mx-auto text-center w-full md:w-[170px]">
                  {/* Leaf motif */}
                  <div className="text-[#C5A384] mb-1 opacity-60 w-8 h-8 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2C12,2 8,6 8,10C8,12 9,14 11,15.5C11,17.5 10.5,19 8.5,21C11.5,21 13.5,19 14,16.5C16,14.5 17,12.5 17,10C17,6 12,2 12,2ZM11.5,14C11.1,13.7 10.5,13.1 10.2,12C9.9,10.6 10.4,8.8 11.2,7.2C11.3,7 11.6,6.9 11.8,7.1C12,7.3 12.1,7.6 11.9,7.8C11.3,9 10.9,10.5 11.1,11.6C11.4,12.4 11.8,12.9 12.1,13.1C12.3,13.3 12.3,13.6 12.1,13.8C12,14 11.7,14 11.5,14Z" />
                    </svg>
                  </div>
                  <div className="relative">
                    <div
                      className="text-[3rem] font-serif font-bold text-[#C5A384] leading-none mb-3"
                      style={{ textShadow: '0 2px 12px rgba(197,163,132,0.25)' }}
                    >
                      {step.n}
                    </div>
                    {/* Subtle glow behind number */}
                    <div className="absolute inset-0 -z-10 bg-amber-100/20 rounded-full blur-[20px] scale-[2]" />
                    {i === 2 && <StarSparkle className="w-5 h-5 -top-2 -right-4 text-amber-300" delay={2} />}
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-800 mb-1">{step.title}</h3>
                  <p className="text-[12px] text-gray-500 font-medium">{step.desc}</p>
                </div>

                {/* Arrow between steps */}
                {i < 2 && (
                  <div className="hidden md:flex items-center text-[#C5A384] opacity-40 px-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Final CTA — Grand closing */}
          <div className="mt-28 relative">
            {/* Ambient glow behind CTA */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-gradient-to-r from-amber-100/40 to-rose-100/30 rounded-full blur-[60px] -z-10" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-[1.8rem] font-bold text-gray-800 mb-4 tracking-tight leading-snug">
                지금 시작하면 결혼 준비가 달라집니다
              </h2>
              <p className="text-gray-600 font-semibold mb-10 text-[14px]">
                복잡한 결혼 준비, Wepln과 함께라면 체계적이고 즐거운 여정이 됩니다.
              </p>
              <div className="relative inline-block">
                <ShimmerButton href="/login">
                  무료로 시작하기 {'>'}
                </ShimmerButton>
                <StarSparkle className="w-8 h-8 -top-4 -right-5 text-amber-300" delay={0.5} />
                <StarSparkle className="w-5 h-5 -top-6 right-6 text-rose-200" delay={2.5} />
                <DiamondSparkle className="w-3 h-3 -bottom-2 -left-3 text-rose-300" delay={2} />
                <DiamondSparkle className="w-2 h-2 top-0 -left-5 text-amber-400" delay={3.5} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer
        className="relative z-20 pt-16 pb-8 border-t border-[#BA9776]/20"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
          <span className="font-serif font-bold text-2xl text-[#BA9776] mb-3">Wepln</span>
          <p className="text-[12px] text-gray-500 font-bold">© 2026 Wepln. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
