const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');

// 1. Update imports safely, handling CRLF and arbitrary whitespace
code = code.replace(/import \{([\s\S]*?)\} from 'lucide-react'/, (match, content) => {
  if (!content.includes('ChevronLeft')) {
    return `import { ChevronLeft, ChevronRight, ` + content.trim() + ` } from 'lucide-react'`;
  }
  return match;
});

// 2. Insert FeatureSlider before Main Page
const featureSliderCode = `
/* ─── Feature Slider ─── */
function FeatureSlider() {
  const [active, setActive] = useState(0)

  const items = [
    {
      id: 'dday',
      title: '일정 & D-Day',
      desc: '결혼식까지 남은 시간과 중요한 웨딩 일정을 한눈에 확인하세요.',
      icon: CalendarHeart,
      color: '#A78BFA',
      content: (
        <div className="flex flex-col items-center w-full mt-4">
          <div className="text-[4rem] sm:text-[5rem] font-bold text-white/90 font-cinzel leading-none mb-6">D-247</div>
          <div className="w-full space-y-3 px-2 sm:px-6">
            {[
              { label: '웨딩홀 투어', date: '3월 15일', color: '#A78BFA' },
              { label: '드레스 피팅', date: '4월 02일', color: '#D4A373' },
              { label: '청첩장 발송', date: '5월 10일', color: '#60A5FA' },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center text-sm p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
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
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className={\`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors \${item.done ? 'border-[#A7C4A0] bg-[#A7C4A0]/20' : 'border-white/15'}\`}>
                  {item.done && <div className="w-2.5 h-2.5 rounded-sm bg-[#A7C4A0]" />}
                </div>
                <span className={\`text-sm transition-colors \${item.done ? 'text-white/30 line-through' : 'text-white/80 font-medium'}\`}>{item.l}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-white/[0.05]">
            <div className="flex justify-between text-xs text-white/40 mb-3 font-medium">
              <span>전체 진행률</span><span className="text-[#A7C4A0] font-bold text-sm">40%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-[#A7C4A0] to-[#6BAE68]" />
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
            <div className="text-5xl sm:text-6xl font-bold text-white/90 leading-none mb-3 tracking-tight">2,400<span className="text-xl font-normal text-white/40 ml-1">만원</span></div>
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
                  <div className="h-full rounded-full" style={{ width: \`\${b.p}%\`, background: b.c }} />
                </div>
                <span className="text-sm text-white/40 w-10 text-right font-bold">{b.p}%</span>
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
          {[
            { name: '그랜드 워커힐 서울', tag: '호텔 웨딩 · 광진구', score: '98점', color: '#60A5FA', tags: ['어두운 홀', '식대 10만원'] },
            { name: '스냅 스튜디오 강남', tag: '스튜디오 · 강남구', score: '95점', color: '#A78BFA', tags: ['인물 중심', '자연광'] },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0" style={{ background: \`linear-gradient(135deg, \${v.color}22, \${v.color}0A)\` }} />
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm sm:text-base font-bold truncate mb-1">{v.name}</div>
                <div className="text-white/30 text-xs sm:text-sm mb-2">{v.tag}</div>
                <div className="flex gap-1.5 flex-wrap">
                  {v.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 shrink-0">{t}</span>)}
                </div>
              </div>
              <div className="text-base sm:text-lg font-black flex-shrink-0" style={{ color: v.color }}>{v.score}</div>
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#F9A8D4] to-[#F472B6] flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_30px_rgba(249,168,212,0.25)] ring-4 ring-white/[0.02]">
                👩
              </div>
              <span className="text-white/40 text-xs sm:text-sm font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mt-2">신부</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart size={32} className="text-[#F9A8D4] fill-[#F9A8D4] animate-pulse" />
              <span className="text-[10px] sm:text-xs text-[#F9A8D4]/70 font-bold tracking-wider bg-[#F9A8D4]/10 px-3 py-1.5 rounded-full border border-[#F9A8D4]/20 mt-2">동기화됨</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_30px_rgba(167,139,250,0.25)] ring-4 ring-white/[0.02]">
                👨
              </div>
              <span className="text-white/40 text-xs sm:text-sm font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mt-2">신랑</span>
            </div>
          </div>
          <div className="w-full max-w-[280px] text-center text-white/40 text-sm py-4 rounded-2xl border border-white/[0.1] bg-white/[0.02] border-dashed">
            초대 코드: <span className="text-white font-mono font-bold tracking-widest ml-2 text-lg">WPLN-2026</span>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Cards Container */}
      <div className="relative w-full h-[550px] sm:h-[650px] flex justify-center items-center overflow-hidden">
        {items.map((item, i) => {
          const offset = i - active
          const absOffset = Math.abs(offset)
          const zIndex = 10 - absOffset
          
          // Size & Positioning Calculations
          const scale = 1 - absOffset * 0.12
          const opacity = absOffset >= 2 ? 0 : (1 - absOffset * 0.4)
          // Move them outward
          const translateX = offset * 320 // Mobile distance
          const smTranslateX = offset * 460 // Desktop distance
          
          // Hidden items shouldn't take clicks
          const isVisible = absOffset < 2
          
          return (
            <div
              key={item.id}
              onClick={() => isVisible && setActive(i)}
              className={\`absolute top-1/2 left-1/2 w-[300px] sm:w-[500px] h-[480px] sm:h-[600px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                \${isVisible ? 'cursor-pointer' : 'pointer-events-none'}
              \`}
              style={{
                zIndex,
                opacity,
                transform: \`translate(-50%, -50%) translateX(\${translateX}px) scale(\${scale})\`,
              }}
            >
              <style jsx>{\`
                @media (min-width: 640px) {
                  div {
                    transform: translate(-50%, -50%) translateX(\${smTranslateX}px) scale(\${scale}) !important;
                  }
                }
              \`}</style>
              
              {/* The Card */}
              <div 
                className={\`w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden backdrop-blur-md transition-all duration-700
                  \${offset === 0 
                      ? 'bg-gradient-to-b from-white/[0.06] to-white/[0.02] border focus' 
                      : 'bg-white/[0.02] border'}
                \`}
                style={{
                  borderColor: offset === 0 ? \`\${item.color}40\` : 'rgba(255,255,255,0.05)',
                  boxShadow: offset === 0 ? \`0 20px 60px \${item.color}15, inset 0 1px 0 rgba(255,255,255,0.1)\` : 'none'
                }}
              >
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-white/[0.05] h-[140px] flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: \`\${item.color}15\`, border: \`1px solid \${item.color}30\` }}>
                      <item.icon size={22} color={item.color} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{item.title}</h3>
                  </div>
                  <p className="text-white/40 text-sm sm:text-base leading-relaxed break-keep">{item.desc}</p>
                </div>
                
                {/* Content Mockup */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col relative bg-[#05050A]/40 overflow-hidden">
                   {/* Blur overlay for inactive cards */}
                   {offset !== 0 && (
                     <div className="absolute inset-0 z-10 bg-[#0A0A14]/40 backdrop-blur-[2px]" />
                   )}
                   {item.content}
                </div>
              </div>
            </div>
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
               className={\`h-2.5 rounded-full transition-all duration-500 cursor-pointer \${i === active ? 'w-10 bg-white' : 'w-2.5 bg-white/20 hover:bg-white/40'}\`} 
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

/* ─── Main Page ─── */
`;

if (!code.includes('function FeatureSlider()')) {
  code = code.replace(/\/\* ─── Main Page ─── \*\//, featureSliderCode);
}

// 3. Replace Bento Features with Slider wrapper, handle CRLF in regex by using \s+
const bentoRegex = /\{\/\* ══════════════════════════════════\s+BENTO FEATURES\s+══════════════════════════════════ \*\/\}\s+<section className="py-24 px-5 bg-\[#0A0A14\]" id="features">[\s\S]*?<\/section>/;

const sliderHTML = `      {/* ══════════════════════════════════
          SLIDER FEATURES
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-5 bg-[#0A0A14] overflow-hidden" id="features">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center">
          
          <div className="text-center mb-6 sm:mb-12 z-20">
            <span className="inline-block text-[10px] font-bold tracking-[3px] text-[#D4A373] uppercase mb-4 px-4 py-1.5 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/20">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              결혼 준비의 모든 것,<br className="sm:hidden" /> Wepln 하나로
            </h2>
            <p className="text-white/40 text-sm md:text-base break-keep">어렵고 막막한 결혼 준비, 슬라이드로 기능을 먼저 살펴보세요.</p>
          </div>

          <FeatureSlider />

        </div>
      </section>`;

code = code.replace(bentoRegex, sliderHTML);

fs.writeFileSync('app/page.tsx', code, 'utf-8');
console.log('Script ran successfully');
