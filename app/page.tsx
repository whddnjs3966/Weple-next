'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, ChevronDown, ChevronLeft, ChevronRight, CalendarHeart, CheckSquare,
  PiggyBank, Heart, Sparkles, Users, Zap, Bot,
} from 'lucide-react'
import Particles from '@/components/Particles'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import clsx from 'clsx'

/* ─── 3D Tilt Card (Framer Motion) ─── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.018 }}
      className={clsx("relative rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.05)] transition-shadow duration-500", className)}
    >
      <div
        className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
        style={{ transform: "translateZ(30px)" }}
      ></div>
      {children}
    </motion.div>
  );
}


/* ─── Feature Slider ─── */
function FeatureSlider() {
  const [active, setActive] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const items = [
    {
      id: 'dday',
      title: '일정 & D-Day',
      desc: '결혼식까지 남은 시간과 중요한 웨딩 일정을 한눈에 확인하세요.',
      icon: CalendarHeart,
      color: '#A78BFA',
      content: (
        <div className="flex flex-col items-center w-full mt-4">
          <div className="text-[4rem] sm:text-[5rem] font-bold text-white/90 font-cinzel leading-none mb-6 drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]">D-247</div>
          <div className="w-full space-y-3 px-2 sm:px-6">
            {[
              { label: '웨딩홀 투어', date: '3월 15일', color: '#A78BFA' },
              { label: '드레스 피팅', date: '4월 02일', color: '#D4A373' },
              { label: '청첩장 발송', date: '5월 10일', color: '#60A5FA' },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center text-sm p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: s.color, color: s.color }} />
                  <span className="text-white/70 font-medium">{s.label}</span>
                </div>
                <span className="text-white/40">{s.date}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'checklist',
      title: '체크리스트',
      desc: '수많은 결혼 준비 항목, 꼼꼼하고 완벽하게 관리하세요.',
      icon: CheckSquare,
      color: '#A7C4A0',
      content: (
        <div className="w-full flex-1 flex flex-col justify-center px-2 sm:px-6">
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-hidden">
            {[
              { l: '예식장 계약', done: true },
              { l: '스드메 예약', done: true },
              { l: '신혼여행 예약', done: false },
              { l: '청첩장 제작', done: false },
              { l: '상견례', done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-md">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${item.done ? 'border-[#A7C4A0] bg-[#A7C4A0]/20 shadow-[0_0_10px_rgba(167,196,160,0.3)]' : 'border-white/15'}`}>
                  {item.done && <div className="w-2.5 h-2.5 rounded-sm bg-[#A7C4A0]" />}
                </div>
                <span className={`text-sm transition-colors ${item.done ? 'text-white/30 line-through' : 'text-white/80 font-medium'}`}>{item.l}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-white/[0.05]">
            <div className="flex justify-between text-xs text-white/40 mb-3 font-medium">
              <span>전체 진행률</span><span className="text-[#A7C4A0] font-bold text-sm drop-shadow-[0_0_5px_rgba(167,196,160,0.5)]">40%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-[#A7C4A0] to-[#6BAE68] shadow-[0_0_10px_rgba(167,196,160,0.5)]" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'budget',
      title: '예산 관리',
      desc: '전체 예산 설정부터 항목별 지출 비율까지 실시간으로 파악하세요.',
      icon: PiggyBank,
      color: '#D4A373',
      content: (
        <div className="w-full flex-1 flex flex-col justify-center px-2 sm:px-4">
          <div className="text-center mb-10">
            <div className="text-5xl sm:text-6xl font-bold text-white/90 leading-none mb-3 tracking-tight drop-shadow-[0_0_15px_rgba(212,163,115,0.4)]">2,400<span className="text-xl font-normal text-white/40 ml-1">만원</span></div>
            <div className="text-sm text-white/40 font-medium tracking-wide">총 예산 5,000만원 중 사용</div>
          </div>
          <div className="space-y-4">
            {[
              { l: '웨딩홀', p: 52, c: '#D4A373' },
              { l: '스드메', p: 22, c: '#A78BFA' },
              { l: '신혼여행', p: 18, c: '#60A5FA' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-white/50 w-14 font-medium">{b.l}</span>
                <div className="flex-1 h-3 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full rounded-full shadow-[0_0_8px_currentColor]" style={{ width: `${b.p}%`, background: b.c, color: b.c }} />
                </div>
                <span className="text-sm text-white/40 w-10 text-right font-bold drop-shadow-[0_0_3px_currentColor]" style={{ color: b.c }}>{b.p}%</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      title: 'AI 장소 추천',
      desc: '원하는 분위기와 예산을 입력하면 최적의 장소를 찾아드려요.',
      icon: Bot,
      color: '#60A5FA',
      content: (
        <div className="w-full flex-1 flex flex-col justify-center space-y-4 sm:px-2">
          {['그랜드 워커힐 서울', '어두운 홀', '식대 10만원', '호텔 웨딩 · 광진구', '98점', '#60A5FA', '스냅 스튜디오 강남', '인물 중심', '자연광', '스튜디오 · 강남구', '95점', '#A78BFA'].length === 0 ? null : [
            { name: '그랜드 워커힐 서울', tag: '호텔 웨딩 · 광진구', score: '98점', color: '#60A5FA', tags: ['어두운 홀', '식대 10만원'] },
            { name: '스냅 스튜디오 강남', tag: '스튜디오 · 강남구', score: '95점', color: '#A78BFA', tags: ['인물 중심', '자연광'] },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-md">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0" style={{ background: `linear-gradient(135deg, ${v.color}22, ${v.color}0A)`, boxShadow: `inset 0 0 0 1px ${v.color}40` }} />
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm sm:text-base font-bold truncate mb-1">{v.name}</div>
                <div className="text-white/30 text-xs sm:text-sm mb-2">{v.tag}</div>
                <div className="flex gap-1.5 flex-wrap">
                  {v.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 shrink-0">{t}</span>)}
                </div>
              </div>
              <div className="text-base sm:text-lg font-black flex-shrink-0 drop-shadow-[0_0_8px_currentColor]" style={{ color: v.color }}>{v.score}</div>
            </div>
          ))}
          <div className="text-center text-white/40 text-[13px] mt-4 bg-[#60A5FA]/10 py-3.5 rounded-xl border border-[#60A5FA]/20 text-[#60A5FA] font-bold tracking-wide shadow-[0_4px_20px_rgba(96,165,250,0.1)]">
            ✨ AI 맞춤 큐레이션 완료
          </div>
        </div>
      )
    },
    {
      id: 'share',
      title: '커플 공유',
      desc: '초대 코드 하나로 파트너와 모든 진행 상황을 실시간 동기화하세요.',
      icon: Users,
      color: '#F9A8D4',
      content: (
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-6 sm:gap-10 mb-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#F9A8D4] to-[#F472B6] flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_30px_rgba(249,168,212,0.4)] ring-4 ring-white/[0.05] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-50 mix-blend-overlay"></div>
                👩
              </div>
              <span className="text-white/40 text-xs sm:text-sm font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mt-2 backdrop-blur-sm">신부</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart size={32} className="text-[#F9A8D4] fill-[#F9A8D4] animate-pulse drop-shadow-[0_0_15px_rgba(249,168,212,0.6)]" />
              <span className="text-[10px] sm:text-xs text-[#F9A8D4]/90 font-bold tracking-wider bg-[#F9A8D4]/10 px-3 py-1.5 rounded-full border border-[#F9A8D4]/30 mt-2 shadow-[0_0_10px_rgba(249,168,212,0.2)]">동기화됨</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_30px_rgba(167,139,250,0.4)] ring-4 ring-white/[0.05] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-50 mix-blend-overlay"></div>
                👨
              </div>
              <span className="text-white/40 text-xs sm:text-sm font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mt-2 backdrop-blur-sm">신랑</span>
            </div>
          </div>
          <div className="w-full max-w-[280px] text-center text-white/60 text-sm py-4 rounded-2xl border border-white/[0.15] bg-white/[0.02] border-dashed backdrop-blur-md">
            초대 코드: <span className="text-white font-mono font-bold tracking-widest ml-2 text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">WPLN-2026</span>
          </div>
        </div>
      )
    }
  ]

  const cardWidth = isDesktop ? 500 : 300
  const cardHeight = isDesktop ? 600 : 480
  const gap = isDesktop ? 460 : 320

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Cards Container */}
      <div
        className="relative w-full flex justify-center items-center overflow-hidden"
        style={{ height: isDesktop ? 650 : 550 }}
      >
        {items.map((item, i) => {
          const offset = i - active
          const absOffset = Math.abs(offset)
          const zIndex = 10 - absOffset
          const scale = 1 - absOffset * 0.12
          const cardOpacity = absOffset >= 2 ? 0 : (1 - absOffset * 0.4)
          const tx = offset * gap
          const isVisible = absOffset < 2

          return (
            <motion.div
              key={item.id}
              onClick={() => isVisible && setActive(i)}
              initial={false}
              animate={{
                x: `calc(-50% + ${tx}px)`,
                y: '-50%',
                scale,
                opacity: cardOpacity,
                zIndex
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.8 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: cardWidth,
                height: cardHeight,
                pointerEvents: isVisible ? 'auto' : 'none',
                cursor: isVisible ? 'pointer' : 'default',
              }}
            >
              {/* The Card */}
              <div
                className="w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-700 relative group"
                style={{
                  background: offset === 0
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'rgba(255,255,255,0.02)',
                  border: '1px solid',
                  borderColor: offset === 0 ? `${item.color}50` : 'rgba(255,255,255,0.05)',
                  boxShadow: offset === 0 ? `0 20px 80px -20px ${item.color}40, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
                }}
              >
                {/* Noise overlay for glassmorphism 2.0 */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                {/* Header */}
                <div
                  className="border-b border-white/[0.08] flex flex-col justify-center relative z-10"
                  style={{ padding: isDesktop ? '2rem' : '1.5rem', height: 140 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_currentColor] transition-all" style={{ background: `${item.color}15`, border: `1px solid ${item.color}40`, color: item.color }}>
                      <item.icon size={22} color={item.color} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{item.title}</h3>
                  </div>
                  <p className="text-white/50 text-sm sm:text-base leading-relaxed break-keep">{item.desc}</p>
                </div>

                {/* Content Mockup */}
                <div
                  className="flex-1 flex flex-col relative overflow-hidden z-10"
                  style={{ padding: isDesktop ? '2rem' : '1.5rem', background: 'rgba(5,5,10,0.5)' }}
                >
                  {offset !== 0 && (
                    <div className="absolute inset-0 z-20 bg-[#0A0A14]/50 backdrop-blur-[2px] transition-all duration-500" />
                  )}
                  {item.content}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-6 mt-6 sm:mt-10">
        <button
          onClick={() => setActive(Math.max(0, active - 1))}
          className="p-4 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all disabled:opacity-30 disabled:hover:bg-white/[0.03]"
          disabled={active === 0}
        >
          <ChevronLeft size={20} className="text-white/70" />
        </button>
        <div className="flex gap-3">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${i === active ? 'w-10 bg-white' : 'w-2.5 bg-white/20 hover:bg-white/40'}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
        <button
          onClick={() => setActive(Math.min(items.length - 1, active + 1))}
          className="p-4 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all disabled:opacity-30 disabled:hover:bg-white/[0.03]"
          disabled={active === items.length - 1}
        >
          <ChevronRight size={20} className="text-white/70" />
        </button>
      </div>
    </div>
  )
}

/* ─── Pain Point Slider ─── */
function PainPointSlider() {
  const [active, setActive] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const cards = [
    {
      emoji: '😰',
      q: '예식장은 잡았는데... 그 다음엔 뭐부터 해야 하죠? 놓치는 게 있을까봐 불안해요.',
      detail: '결혼일을 등록하면 시기별 준비 항목이 자동으로 정리돼요. 빠뜨릴 걱정 없이 할 일에만 집중하세요.',
      a: 'D-Day 기반 맞춤 체크리스트 자동 생성',
      color: '#A78BFA',
    },
    {
      emoji: '💑',
      q: '나는 알고 있는데 파트너는 어디까지 알고 있을까요? 매번 공유하기가 너무 번거로워요.',
      detail: '초대 코드 하나로 연결하면 체크리스트·일정·예산이 파트너와 실시간으로 함께 보여요.',
      a: '초대 코드 하나로 모든 정보 커플 공유',
      color: '#F9A8D4',
    },
    {
      emoji: '🏛️',
      q: '웨딩홀·스튜디오를 어떻게 골라야 할까요? 찾아봐도 선택지가 너무 많아서 막막해요.',
      detail: '원하는 위치, 예산, 분위기를 입력하면 AI가 우리 커플에게 딱 맞는 장소를 추천해드려요.',
      a: 'AI가 위치·예산·스타일 기반으로 추천',
      color: '#60A5FA',
    },
  ]

  const cardW = isDesktop ? 420 : 300
  const cardH = isDesktop ? 370 : 340
  const spacing = isDesktop ? 440 : 320

  return (
    <section className="py-24 bg-[#07070F] overflow-hidden" id="stories">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">
        <div className="text-center mb-6 sm:mb-12 px-5">
          <span className="inline-block text-[10px] font-bold tracking-[3px] text-[#A78BFA] uppercase mb-4 px-4 py-1.5 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20">
            이런 커플에게 딱
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">이런 고민, 있으신가요?</h2>
        </div>

        {/* Slider */}
        <div className="w-full flex flex-col items-center select-none">
          <div
            className="relative w-full flex justify-center items-center"
            style={{ height: cardH + 60 }}
          >
            {cards.map((card, i) => {
              const offset = i - active
              const absOffset = Math.abs(offset)
              const zIndex = 10 - absOffset
              const scale = 1 - absOffset * 0.1
              const cardOpacity = absOffset >= 2 ? 0 : (1 - absOffset * 0.45)
              const tx = offset * spacing

              return (
                <div
                  key={i}
                  onClick={() => absOffset < 2 && setActive(i)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: cardW,
                    height: cardH,
                    zIndex,
                    opacity: cardOpacity,
                    transform: `translate(-50%, -50%) translateX(${tx}px) scale(${scale})`,
                    transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
                    pointerEvents: absOffset < 2 ? 'auto' : 'none',
                    cursor: absOffset < 2 ? 'pointer' : 'default',
                  }}
                >
                  <div
                    className="w-full h-full rounded-[2rem] flex flex-col justify-between backdrop-blur-md overflow-hidden"
                    style={{
                      padding: isDesktop ? '2rem' : '1.5rem',
                      background: offset === 0
                        ? `linear-gradient(145deg, ${card.color}18 0%, rgba(7,7,15,0.9) 100%)`
                        : 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: offset === 0 ? `${card.color}35` : 'rgba(255,255,255,0.05)',
                      boxShadow: offset === 0 ? `0 16px 48px ${card.color}12` : 'none',
                    }}
                  >
                    <div>
                      <span className="text-4xl block mb-3">{card.emoji}</span>
                      <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-3">&ldquo;{card.q}&rdquo;</p>
                      <p className="text-white/30 text-xs sm:text-sm leading-relaxed break-keep">{card.detail}</p>
                    </div>
                    <div className="pt-4 border-t border-white/[0.08]">
                      <p className="text-[10px] font-bold tracking-[2px] text-white/25 uppercase mb-2.5">Wepln 솔루션</p>
                      <div
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                        style={{
                          background: `${card.color}18`,
                          border: `1px solid ${card.color}35`,
                          boxShadow: `0 4px 16px ${card.color}10`,
                        }}
                      >
                        <Zap size={18} style={{ color: card.color }} className="flex-shrink-0" />
                        <span className="text-sm sm:text-base font-bold leading-snug break-keep" style={{ color: card.color }}>{card.a}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dots */}
          <div className="flex gap-3 mt-4">
            {cards.map((_, i) => (
              <div
                key={i}
                className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${i === active ? 'w-10 bg-white' : 'w-2.5 bg-white/20 hover:bg-white/40'}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


/* ─── Main Page ─── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [aurora, setAurora] = useState({ x: 40, y: 40 })
  const heroRef = useRef<HTMLElement>(null)

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
        <div className="relative z-[3] flex flex-col items-center text-center px-5 w-full max-w-4xl mx-auto pt-32 pb-32">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[#D4A373] text-xs font-semibold mb-8 tracking-widest backdrop-blur-sm">
            <Sparkles size={11} /> Wedding Planner
          </span>

          {/* Headline */}
          <h1 className="text-[clamp(2.4rem,5.8vw,4.4rem)] font-bold text-white leading-[1.16] mb-5 tracking-[-1.5px]">
            결혼 준비의 모든 것,<br />
            <span className="bg-gradient-to-r from-[#D4A373] via-[#EDD5A3] to-[#A78BFA] bg-clip-text text-transparent">
              Wepln 하나로
            </span>
          </h1>

          <p className="text-white/45 text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto break-keep">
            일정, 예산, 체크리스트, 업체 추천까지<br />
            커플이 함께 관리하는 올인원 웨딩 플래너
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
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
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3]">
          <ChevronDown size={18} className="text-white/20 animate-bounce" />
        </div>
      </section>

      {/* ══════════════════════════════════
          SLIDER FEATURES
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-5 bg-[#0A0A14] overflow-hidden" id="features">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center">

          <div className="text-center mb-6 sm:mb-12 z-20">
            <span className="inline-block text-[10px] font-bold tracking-[3px] text-[#D4A373] uppercase mb-4 px-4 py-1.5 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/20">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              어떤 기능이 있나요?
            </h2>
            <p className="text-white/40 text-sm md:text-base break-keep">Wepln이 제공하는 핵심 기능을 살펴보세요.</p>
          </div>

          <FeatureSlider />

        </div>
      </section>

      {/* ══════════════════════════════════
          PAIN POINTS — 이런 고민, 있으신가요?
      ══════════════════════════════════ */}
      <PainPointSlider />

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
                  desc: '결혼 예정일과 예산을 입력하면 D-Day 기반 체크리스트가 자동으로 생성돼요.',
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
                  title: '함께 준비 완료',
                  desc: 'AI 장소 추천, 일정 관리, 예산 추적까지 — Wepln에서 빠짐없이 챙겨드려요.',
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
          <p className="text-white/32 mb-10 leading-relaxed text-sm break-keep">
            복잡한 결혼 준비, Wepln과 함께라면<br />체계적이고 즐거운 여정이 됩니다.
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
