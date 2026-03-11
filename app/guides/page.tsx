import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, HeartHandshake, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
    title: '결혼 준비 가이드 | 무료 모바일 웨딩플래너 WEPLN',
    description: '웨딩플래너 없이도 완벽한 결혼 준비! 상견례, 웨딩홀 투어부터 스드메 체크리스트까지 WEPLN(위플랜) 가이드와 함께 똑똑하고 스마트하게 예산을 관리하며 결혼을 준비하세요.',
    keywords: ['결혼준비', '웨딩플래너', '모바일 웨딩플래너', '결혼체크리스트', '결혼예산', '결혼 준비 엑셀'],
    openGraph: {
        title: '스마트한 모바일 웨딩플래너 WEPLN 가이드',
        description: '결혼 준비 엑셀 대신 WEPLN 어플리케이션으로 커플이 함께 완벽한 결혼을 다이렉트로 준비하세요.',
    }
}

export default function WeddingGuidePage() {
    return (
        <div className="min-h-screen bg-[#FCFAF6] font-sans text-gray-800 pb-20">

            {/* ─────────────────────────────────────────────
          헤더 및 네비게이션 간이 버전
      ───────────────────────────────────────────── */}
            <nav className="bg-white/90 backdrop-blur-md shadow-sm py-4 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-serif text-[#BE9B7B]">Wepln</span>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition flex items-center">
                            시작하기
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─────────────────────────────────────────────
          본문 가이드 매거진 스타일 영역
      ───────────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-6 pt-16 mt-8 bg-white shadow-xl rounded-3xl p-8 sm:p-12 border border-[#BE9B7B]/10">

                {/* 헤드라인 */}
                <header className="text-center mb-16">
                    <div className="text-[12px] font-bold tracking-[2px] text-[#BA9776] uppercase mb-4 block font-serif flex items-center justify-center gap-2">
                        <Sparkles size={14} /> WEPLN GUIDE <Sparkles size={14} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-bold text-gray-800 mb-6 tracking-tight leading-snug">
                        스마트한 모바일 웨딩플래너,<br />
                        <span className="text-[#BA9776]">위플랜(WEPLN)</span> 활용 완벽 가이드
                    </h1>
                    <p className="text-gray-600 text-[16px] sm:text-[18px] leading-[1.7] break-keep font-medium">
                        복잡한 결혼 준비 엑셀은 이제 그만!<br className="hidden sm:block" />
                        위플랜 앱 하나로 예비 부부가 함께 똑똑하게 결혼을 준비하는 방법을 안내합니다.
                    </p>
                </header>

                <article className="prose prose-lg max-w-none text-gray-700 leading-loose prose-headings:text-gray-800 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100 prose-h3:text-[20px] prose-h3:mt-8 prose-h3:mb-4">

                    <h2>1. 웨딩플래너, 꼭 오프라인에서 만나야 할까요?</h2>
                    <p>
                        결혼을 결심하고 가장 먼저 드는 고민은 <strong>"웨딩플래너와 함께할 것인가, 워킹(셀프)으로 준비할 것인가"</strong> 입니다. 하지만 바쁜 현대 사회에서 스튜디오, 드레스, 메이크업(일일이 스드메라고 하죠) 협력 업체를 돌아다니고, 수백 개의 웨딩홀을 비교하는 일은 생각보다 벅찹니다.
                    </p>
                    <p>
                        그래서 탄생한 것이 바로 <strong>모바일 웨딩플래너 어플 WEPLN</strong>입니다. 당신의 스마트폰 속에 언제나 함께하는 웨딩플래너로, 시공간의 제약 없이 언제 어디서나 결혼 준비의 모든 것을 체크할 수 있습니다.
                    </p>

                    <h2>2. 엑셀파일을 대체하는 위플랜의 스마트한 기능</h2>
                    <p>
                        인터넷 커뮤니티에서 구한 복잡한 '결혼준비 엑셀', 모바일에서 열어보기 힘들고 파트너와 동기화도 안 되셨나요? 위플랜은 다음과 같은 기능으로 결혼 준비의 피로도를 낮춥니다.
                    </p>

                    <ul className="list-none space-y-6 pl-0 my-8">
                        {[
                            { title: 'D-Day 기반 자동 일정 관리', desc: '결혼식 날짜만 입력하면, 상견례부터 웨딩홀 투어, 스드메 피팅, 청첩장 발송까지 남은 기간에 맞춰 알아서 일정을 추천하고 관리해 줍니다.' },
                            { title: '초대 코드로 커플 동기화 기능', desc: '하나의 계정으로 파트너를 초대하세요! 신랑 신부가 각각 엑셀을 저장할 필요 없이 실시간으로 체크리스트와 예산을 공유합니다.' },
                            { title: '웨딩 가계부 및 예산 관리', desc: '수백만 원에서 수천만 원까지 오가는 계약금과 잔금. 식대, 웨딩밴드, 허니문 예산을 한눈에 파악하고 효율적으로 관리하세요.' },
                            { title: 'AI 맞춤 장소 추천', desc: 'AI가 우리 커플의 예산과 원하는 지역에 가장 적합한 웨딩홀과 스드메 업체를 분석해 추천해 줍니다. 수백 개의 업체 후기를 뒤질 필요가 없습니다.' }
                        ].map((item, idx) => (
                            <li key={idx} className="flex gap-4 items-start bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                                <CheckCircle2 className="text-[#BA9776] shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="!mt-0 !mb-1 text-[17px]">{item.title}</h3>
                                    <p className="!my-0 text-[15px] text-gray-600 leading-[1.6] break-keep">{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <h2>3. 모바일 웨딩플래너와 함께하는 성공적인 결혼 준비 단계</h2>
                    <p>
                        Wepln을 활용해 가장 이상적인 형태의 결혼 준비 타임라인을 구성해 보세요.
                    </p>
                    <ol className="list-decimal pl-5 space-y-4 marker:text-[#BA9776] marker:font-bold">
                        <li><strong>D-1년 ~ D-10개월:</strong> 양가 부모님 인사 및 웨딩 베뉴(예식장) 투어 시작. Wepln의 AI 장소 추천 기능을 활용해 후보를 좁히세요.</li>
                        <li><strong>D-8개월 ~ D-6개월:</strong> 이 시기에는 스드메 예약을 마쳐야 합니다. Wepln 예산 관리 탭에 스드메 예산을 등록하고 꼼꼼히 잔금을 기록하세요.</li>
                        <li><strong>D-5개월 ~ D-3개월:</strong> 상견례, 신혼여행 코스 예약, 예물 및 예복 투어. 부부가 서로 Wepln 체크리스트를 공유하며 놓친 항목을 확인합니다.</li>
                        <li><strong>D-2개월 ~ D-1개월:</strong> 모바일 및 종이 청첩장 발송, 부케 및 식권 수령 등 디테일 점검 마무리.</li>
                    </ol>

                    <h2>4. 더 이상 혼자 준비하지 마세요!</h2>
                    <p>
                        결혼 준비 과정이 스트레스가 아니라 설레는 여정이 될 수 있도록 <strong>모바일 웨딩플래너 위플랜</strong>이 가장 든든한 조력자가 되겠습니다.
                    </p>
                    <p className="flex items-center gap-2 font-bold text-[#BA9776]">
                        <HeartHandshake className="text-[#E07A84]" /> 당신의 아름다운 출발을 응원합니다.
                    </p>

                </article>

                {/* ─────────────────────────────────────────────
            CTA (Call to Action) 바텀 영역
        ───────────────────────────────────────────── */}
                <section className="mt-20 py-12 px-6 rounded-[2rem] bg-gradient-to-br from-[#FCFAF6] to-[#FFF5EC] border border-[#BA9776]/20 text-center relative overflow-hidden">
                    {/* 장식용 스파클스 (간략화) */}
                    <div className="absolute top-4 right-6 text-amber-200 opacity-60">✨</div>
                    <div className="absolute bottom-6 left-8 text-rose-200 opacity-50">✨</div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">
                        지금 위플랜과 함께 결혼 준비를 시작하세요
                    </h2>
                    <p className="text-gray-600 font-medium mb-8 text-[15px] break-keep max-w-md mx-auto">
                        웨딩 일정, 체크리스트, 예산 관리를 커플과 함께 공유하며 스마트하게 시작해 보세요!
                    </p>

                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 rounded-full text-white font-bold transition-all px-8 py-4 text-[16px] shadow-[0_8px_30px_rgba(190,155,123,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(190,155,123,0.4)]"
                        style={{
                            background: 'linear-gradient(135deg, #D4B896 0%, #C4A07A 40%, #BA9776 70%, #B08A6A 100%)',
                        }}
                    >
                        무료로 위플랜 시작하기
                    </Link>
                </section>

            </main>

            {/* ─────────────────────────────────────────────
          간단 푸터
      ───────────────────────────────────────────── */}
            <footer className="max-w-4xl mx-auto px-6 mt-16 text-center">
                <p className="text-xs text-gray-400 font-medium tracking-wider uppercase flex items-center justify-center gap-3">
                    <span>© 2026 Wepln.</span> <span>All rights reserved.</span> <Link href="/" className="hover:text-gray-600 underline underline-offset-4">메인으로 가기</Link>
                </p>
            </footer>

        </div>
    )
}
