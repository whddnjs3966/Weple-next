export interface AiChecklistItem {
    id: string
    title: string
    description: string
    dDayOffset: number
    estimatedBudget: number
    category: AiChecklistCategory
}

export type AiChecklistCategory =
    | '예식장'
    | '스드메'
    | '예물/예단'
    | '혼수'
    | '신혼집'
    | '신혼여행'
    | '행정/서류'
    | '하객관리'
    | '본식당일'
    | '결혼후'

export interface AiChecklistSection {
    label: string
    range: string
    items: AiChecklistItem[]
}

const CATEGORY_ICONS: Record<AiChecklistCategory, string> = {
    '예식장': '🏛️',
    '스드메': '📸',
    '예물/예단': '💍',
    '혼수': '🏠',
    '신혼집': '🏡',
    '신혼여행': '✈️',
    '행정/서류': '📄',
    '하객관리': '💌',
    '본식당일': '💒',
    '결혼후': '🎊',
}

export function getCategoryIcon(category: AiChecklistCategory): string {
    return CATEGORY_ICONS[category] || '📋'
}

const CATEGORY_COLORS: Record<AiChecklistCategory, string> = {
    '예식장': 'bg-violet-100 text-violet-700',
    '스드메': 'bg-pink-100 text-pink-700',
    '예물/예단': 'bg-amber-100 text-amber-700',
    '혼수': 'bg-blue-100 text-blue-700',
    '신혼집': 'bg-emerald-100 text-emerald-700',
    '신혼여행': 'bg-sky-100 text-sky-700',
    '행정/서류': 'bg-gray-100 text-gray-700',
    '하객관리': 'bg-rose-100 text-rose-700',
    '본식당일': 'bg-fuchsia-100 text-fuchsia-700',
    '결혼후': 'bg-teal-100 text-teal-700',
}

export function getCategoryColor(category: AiChecklistCategory): string {
    return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'
}

const allItems: AiChecklistItem[] = [
    // ── D-365 ~ D-301 (1년 전) ──
    { id: 'ai-01', title: '양가 상견례', description: '양가 부모님 인사 및 결혼 의사 전달, 식사 장소 예약', dDayOffset: -365, estimatedBudget: 300000, category: '행정/서류' },
    { id: 'ai-02', title: '결혼 날짜 확정', description: '양가 의견 반영하여 택일, 달력/손 없는 날 확인', dDayOffset: -350, estimatedBudget: 0, category: '행정/서류' },
    { id: 'ai-03', title: '웨딩 스타일·예산 논의', description: '원하는 웨딩 분위기, 전체 예산 범위 설정', dDayOffset: -340, estimatedBudget: 0, category: '행정/서류' },
    { id: 'ai-04', title: '결혼 자금 계획 수립', description: '양가 지원금, 본인 자금, 대출 계획 등 정리', dDayOffset: -330, estimatedBudget: 0, category: '행정/서류' },
    { id: 'ai-05', title: '웨딩홀 투어 시작', description: '후보 예식장 3~5곳 방문, 날짜·가격·하객 수용 비교', dDayOffset: -320, estimatedBudget: 0, category: '예식장' },
    { id: 'ai-06', title: '웨딩플래너 상담', description: '플래너 필요 여부 결정, 상담 후 계약 검토', dDayOffset: -310, estimatedBudget: 500000, category: '예식장' },

    // ── D-300 ~ D-241 (10~8개월) ──
    { id: 'ai-07', title: '웨딩홀 계약', description: '예식장 확정 후 계약금 납부, 식사 메뉴 사전 협의', dDayOffset: -290, estimatedBudget: 5000000, category: '예식장' },
    { id: 'ai-08', title: '스드메 업체 상담', description: '스튜디오·드레스·메이크업 패키지 3곳 이상 비교', dDayOffset: -280, estimatedBudget: 0, category: '스드메' },
    { id: 'ai-09', title: '신혼집 방향 논의', description: '예산, 위치, 매매/전세 방향, 출퇴근 거리 고려', dDayOffset: -270, estimatedBudget: 0, category: '신혼집' },
    { id: 'ai-10', title: '예물·예단 탐색 시작', description: '양가 예물·예단 범위 사전 논의, 시장 조사', dDayOffset: -260, estimatedBudget: 0, category: '예물/예단' },
    { id: 'ai-11', title: '웨딩 보험 가입 검토', description: '웨딩 관련 보험 상품 비교 및 가입 여부 결정', dDayOffset: -250, estimatedBudget: 100000, category: '행정/서류' },

    // ── D-240 ~ D-181 (8~6개월) ──
    { id: 'ai-12', title: '스드메 계약', description: '스튜디오·드레스·메이크업 패키지 최종 선택 후 계약', dDayOffset: -230, estimatedBudget: 3000000, category: '스드메' },
    { id: 'ai-13', title: '신혼여행지 결정 및 예약', description: '여행지, 항공권, 숙소 예약 (비자·백신 확인)', dDayOffset: -220, estimatedBudget: 3000000, category: '신혼여행' },
    { id: 'ai-14', title: '예복·한복 탐색', description: '예복/한복 매장 방문, 맞춤 시 제작 기간 확인', dDayOffset: -210, estimatedBudget: 0, category: '예물/예단' },
    { id: 'ai-15', title: '피부 관리 시작', description: '결혼식에 맞춰 피부과/에스테틱 정기 관리 시작', dDayOffset: -200, estimatedBudget: 500000, category: '스드메' },
    { id: 'ai-16', title: '본식 스냅/DVD 예약', description: '결혼식 당일 촬영 업체 비교 후 예약', dDayOffset: -200, estimatedBudget: 800000, category: '스드메' },
    { id: 'ai-17', title: '신혼집 본격 탐색', description: '부동산 방문, 매물 비교, 대출 한도 확인', dDayOffset: -190, estimatedBudget: 0, category: '신혼집' },

    // ── D-180 ~ D-121 (6~4개월) ──
    { id: 'ai-18', title: '예물(웨딩링) 구매', description: '여러 매장 방문 후 디자인·사이즈 확정, 각인 의뢰', dDayOffset: -170, estimatedBudget: 4000000, category: '예물/예단' },
    { id: 'ai-19', title: '혼수 리스트 작성', description: '신혼집 입주에 필요한 가전·가구·생활용품 목록 정리', dDayOffset: -160, estimatedBudget: 0, category: '혼수' },
    { id: 'ai-20', title: '리허설(웨딩) 촬영 일정 잡기', description: '스튜디오와 촬영 날짜·콘셉트 조율', dDayOffset: -160, estimatedBudget: 0, category: '스드메' },
    { id: 'ai-21', title: '가전·가구 비교', description: '브랜드별 가격·기능 비교, 할인 시기 체크', dDayOffset: -150, estimatedBudget: 0, category: '혼수' },
    { id: 'ai-22', title: '신혼집 계약', description: '매물 확정 후 계약, 이사 일정 계획', dDayOffset: -140, estimatedBudget: 0, category: '신혼집' },
    { id: 'ai-23', title: '예복·한복 주문', description: '디자인 확정 후 맞춤 주문, 제작 기간 4~6주', dDayOffset: -140, estimatedBudget: 1500000, category: '예물/예단' },
    { id: 'ai-24', title: '예단 품목 결정', description: '양가 협의 후 예단 품목·금액 범위 확정', dDayOffset: -130, estimatedBudget: 0, category: '예물/예단' },

    // ── D-120 ~ D-91 (4~3개월) ──
    { id: 'ai-25', title: '청첩장 디자인 선택', description: '문구 결정 및 시안 확정, 인쇄 업체 선정', dDayOffset: -110, estimatedBudget: 200000, category: '하객관리' },
    { id: 'ai-26', title: '예복·한복 가봉', description: '1차 가봉 후 수선 사항 전달', dDayOffset: -105, estimatedBudget: 0, category: '예물/예단' },
    { id: 'ai-27', title: '가전·가구 구매', description: '최종 결정 후 주문, 배송·설치 일정 조율', dDayOffset: -100, estimatedBudget: 10000000, category: '혼수' },
    { id: 'ai-28', title: '웨딩 촬영 진행', description: '스튜디오/야외 촬영, 소품·의상·헤어메이크업 준비', dDayOffset: -95, estimatedBudget: 0, category: '스드메' },
    { id: 'ai-29', title: '모바일 청첩장 제작', description: '모바일 청첩장 플랫폼 선택, 사진·문구 입력', dDayOffset: -95, estimatedBudget: 50000, category: '하객관리' },

    // ── D-90 ~ D-61 (3~2개월) ──
    { id: 'ai-30', title: '드레스 최종 선택', description: '본식 드레스 확정 및 수선 요청', dDayOffset: -85, estimatedBudget: 0, category: '스드메' },
    { id: 'ai-31', title: '신혼여행 세부 일정 점검', description: '항공권·호텔·여권·비자·여행자보험 재확인', dDayOffset: -80, estimatedBudget: 0, category: '신혼여행' },
    { id: 'ai-32', title: '혼수·예단 최종 조율', description: '양가 부모님과 최종 품목·일정 확인', dDayOffset: -75, estimatedBudget: 0, category: '예물/예단' },
    { id: 'ai-33', title: '메이크업 리허설', description: '본식 메이크업·헤어 스타일 사전 테스트', dDayOffset: -70, estimatedBudget: 0, category: '스드메' },
    { id: 'ai-34', title: '혼주 의상·메이크업 준비', description: '양가 부모님 의상 선정 및 메이크업 예약', dDayOffset: -70, estimatedBudget: 500000, category: '예물/예단' },
    { id: 'ai-35', title: '이사 준비 및 입주', description: '이사 업체 예약, 신혼집 입주·정리', dDayOffset: -65, estimatedBudget: 500000, category: '신혼집' },

    // ── D-60 ~ D-31 (2~1개월) ──
    { id: 'ai-36', title: '청첩장 인쇄 및 발송', description: '최종 교정 확인 후 인쇄, 양가 하객에게 발송', dDayOffset: -55, estimatedBudget: 0, category: '하객관리' },
    { id: 'ai-37', title: '주례·사회자 섭외', description: '주례 또는 사회자 확정, 식순 사전 공유', dDayOffset: -50, estimatedBudget: 200000, category: '본식당일' },
    { id: 'ai-38', title: '축가·축사 섭외', description: '축가/축사 부탁할 지인 섭외 및 곡 선정', dDayOffset: -50, estimatedBudget: 0, category: '본식당일' },
    { id: 'ai-39', title: '감사선물·답례품 준비', description: '포장·수량 결정, 주문 및 배송 일정 확인', dDayOffset: -45, estimatedBudget: 500000, category: '하객관리' },
    { id: 'ai-40', title: '폐백 음식·장소 예약', description: '폐백 음식 업체 선정 및 장소 예약', dDayOffset: -40, estimatedBudget: 300000, category: '본식당일' },
    { id: 'ai-41', title: '영상 편지·식전 영상 제작', description: '성장 영상, 감사 영상 등 촬영·편집', dDayOffset: -40, estimatedBudget: 200000, category: '본식당일' },
    { id: 'ai-42', title: '결혼 소식 알림', description: '지인·직장 동료에게 결혼 소식 알림톡/카드 발송', dDayOffset: -35, estimatedBudget: 0, category: '하객관리' },

    // ── D-30 ~ D-11 (한달 전) ──
    { id: 'ai-43', title: '하객 명단 최종 정리', description: '참석 인원 확인, 식사 인원 집계', dDayOffset: -28, estimatedBudget: 0, category: '하객관리' },
    { id: 'ai-44', title: '식순 확정 및 세부 조율', description: '사회자·주례와 최종 식순 리허설', dDayOffset: -25, estimatedBudget: 0, category: '본식당일' },
    { id: 'ai-45', title: '사례비·봉투 준비', description: '사회자, 주례, 축가, 접수 담당 사례비 봉투 준비', dDayOffset: -20, estimatedBudget: 500000, category: '본식당일' },
    { id: 'ai-46', title: '부케 예약', description: '원하는 꽃·스타일 선택 후 꽃집 예약', dDayOffset: -20, estimatedBudget: 150000, category: '본식당일' },
    { id: 'ai-47', title: '예식장 잔금 정리', description: '예식장·식사 잔금 납부, 추가 옵션 최종 확인', dDayOffset: -18, estimatedBudget: 0, category: '예식장' },
    { id: 'ai-48', title: '모바일 청첩장 발송', description: '카카오톡 등으로 모바일 청첩장 최종 발송', dDayOffset: -15, estimatedBudget: 0, category: '하객관리' },
    { id: 'ai-49', title: '도우미·접수 담당 확정', description: '당일 접수·안내 담당 지인 확정 및 역할 안내', dDayOffset: -14, estimatedBudget: 0, category: '본식당일' },
    { id: 'ai-50', title: '신혼여행 짐 싸기', description: '여행 준비물 체크리스트 작성 및 짐 정리', dDayOffset: -12, estimatedBudget: 0, category: '신혼여행' },

    // ── D-10 ~ D-1 (직전) ──
    { id: 'ai-51', title: '웨딩드레스·턱시도 최종 피팅', description: '수선 완료 확인, 액세서리 매칭 점검', dDayOffset: -7, estimatedBudget: 0, category: '스드메' },
    { id: 'ai-52', title: '뷔페 최종 인원 확정', description: '예식장에 참석 최종 인원 전달', dDayOffset: -5, estimatedBudget: 0, category: '예식장' },
    { id: 'ai-53', title: '개인 소지품 점검', description: '웨딩슈즈, 속옷, 액세서리, 손수건, 스타킹 등', dDayOffset: -5, estimatedBudget: 0, category: '본식당일' },
    { id: 'ai-54', title: '혼인신고서·가족관계 서류 준비', description: '혼인신고서, 가족관계증명서, 주민등록등본 발급', dDayOffset: -4, estimatedBudget: 0, category: '행정/서류' },
    { id: 'ai-55', title: '웨딩카 준비 확인', description: '당일 웨딩카 예약 상태 및 동선 확인', dDayOffset: -3, estimatedBudget: 200000, category: '본식당일' },
    { id: 'ai-56', title: '집중 스킨케어', description: 'D-Day 직전 피부 컨디션 관리 집중', dDayOffset: -3, estimatedBudget: 0, category: '스드메' },
    { id: 'ai-57', title: '예식장 최종 동선 확인', description: '예식장 방문하여 동선·주차·대기실 최종 점검', dDayOffset: -2, estimatedBudget: 0, category: '예식장' },
    { id: 'ai-58', title: '당일 타임테이블 정리', description: '시간대별 스케줄표 작성, 관계자에게 공유', dDayOffset: -1, estimatedBudget: 0, category: '본식당일' },

    // ── D-Day ~ D+30 (당일 이후) ──
    { id: 'ai-59', title: '결혼식 당일', description: '축하합니다! 행복한 하루 보내세요!', dDayOffset: 0, estimatedBudget: 0, category: '본식당일' },
    { id: 'ai-60', title: '신혼여행 출발', description: '설레는 신혼여행을 떠나세요!', dDayOffset: 1, estimatedBudget: 0, category: '신혼여행' },
    { id: 'ai-61', title: '혼인신고', description: '관할 주민센터에 혼인신고서 제출', dDayOffset: 7, estimatedBudget: 0, category: '행정/서류' },
    { id: 'ai-62', title: '감사 인사 전달', description: '도움 주신 분들께 감사 문자·선물 전달', dDayOffset: 10, estimatedBudget: 0, category: '하객관리' },
    { id: 'ai-63', title: '웨딩 사진 셀렉', description: '스튜디오/본식 사진 셀렉 및 보정 요청', dDayOffset: 14, estimatedBudget: 0, category: '스드메' },
    { id: 'ai-64', title: '전입신고', description: '신혼집 주소로 전입신고 처리', dDayOffset: 14, estimatedBudget: 0, category: '행정/서류' },
    { id: 'ai-65', title: '축의금 정산 및 가계부 정리', description: '축의금 내역 정리, 결혼 비용 최종 정산', dDayOffset: 20, estimatedBudget: 0, category: '행정/서류' },
]

export const AI_CHECKLIST_SECTIONS: AiChecklistSection[] = [
    {
        label: '1년 전',
        range: 'D-365 ~ D-301',
        items: allItems.filter(i => i.dDayOffset <= -301 && i.dDayOffset >= -365),
    },
    {
        label: '10~8개월 전',
        range: 'D-300 ~ D-241',
        items: allItems.filter(i => i.dDayOffset <= -241 && i.dDayOffset >= -300),
    },
    {
        label: '8~6개월 전',
        range: 'D-240 ~ D-181',
        items: allItems.filter(i => i.dDayOffset <= -181 && i.dDayOffset >= -240),
    },
    {
        label: '6~4개월 전',
        range: 'D-180 ~ D-121',
        items: allItems.filter(i => i.dDayOffset <= -121 && i.dDayOffset >= -180),
    },
    {
        label: '4~3개월 전',
        range: 'D-120 ~ D-91',
        items: allItems.filter(i => i.dDayOffset <= -91 && i.dDayOffset >= -120),
    },
    {
        label: '3~2개월 전',
        range: 'D-90 ~ D-61',
        items: allItems.filter(i => i.dDayOffset <= -61 && i.dDayOffset >= -90),
    },
    {
        label: '2~1개월 전',
        range: 'D-60 ~ D-31',
        items: allItems.filter(i => i.dDayOffset <= -31 && i.dDayOffset >= -60),
    },
    {
        label: '한달 전',
        range: 'D-30 ~ D-11',
        items: allItems.filter(i => i.dDayOffset <= -11 && i.dDayOffset >= -30),
    },
    {
        label: '직전',
        range: 'D-10 ~ D-1',
        items: allItems.filter(i => i.dDayOffset <= -1 && i.dDayOffset >= -10),
    },
    {
        label: '당일 이후',
        range: 'D-Day ~ D+30',
        items: allItems.filter(i => i.dDayOffset >= 0),
    },
]
