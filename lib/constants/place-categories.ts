export const CATEGORIES = [
    { slug: 'wedding-hall', label: '웨딩홀', emoji: '🏛️' },
    { slug: 'studio', label: '스튜디오', emoji: '📸' },
    { slug: 'dress', label: '드레스', emoji: '👗' },
    { slug: 'makeup', label: '메이크업', emoji: '💄' },
    { slug: 'snap', label: '본식스냅', emoji: '📷' },
    { slug: 'jewelry', label: '예물', emoji: '💍' },
    { slug: 'suit', label: '예복', emoji: '👔' },
    { slug: 'hanbok', label: '한복', emoji: '👘' },
    { slug: 'invitation', label: '청첩장', emoji: '💌' },
    { slug: 'pyebaek', label: '폐백/이바지', emoji: '🎁' },
    { slug: 'bouquet', label: '부케/플라워', emoji: '💐' },
]

export type CategoryFilter = {
    key: string
    label: string
    options: string[] | ((selectedFilters: Record<string, string>) => string[])
}

export const CATEGORY_FILTERS: Record<string, CategoryFilter[]> = {
    'wedding-hall': [
        { key: 'scale', label: '예식 규모', options: ['스몰 웨딩 (100명 이하)', '일반 (100~250명)', '대규모 (250명 이상)'] },
        {
            key: 'mood', label: '홀 분위기', options: (filters) => {
                if (filters.scale === '스몰 웨딩 (100명 이하)') return ['야외/가든', '하우스 앤 파티', '프라이빗 레스토랑']
                return ['어두운 컨벤션/호텔', '밝고 화사한 하우스', '경건한 채플']
            }
        },
        { key: 'meal', label: '식사 형태', options: ['프리미엄 뷔페', '코스 요리(동시예식)', '정갈한 한상차림'] },
        { key: 'price', label: '예상 식대 (1인)', options: ['5만원 이하', '5~8만원', '8~12만원', '12만원 이상'] },
    ],
    'studio': [
        { key: 'focus', label: '촬영 중심', options: ['인물 중심 (심플/클래식)', '배경 중심 (다양한 연출)', '인물+배경 밸런스'] },
        {
            key: 'style', label: '특화 스타일', options: (filters) => {
                if (filters.focus === '인물 중심 (심플/클래식)') return ['깔끔한 무지 배경', '흑백 화보 연출', '자연광 화보']
                if (filters.focus === '배경 중심 (다양한 연출)') return ['웅장한 대형 세트', '푸릇한 정원/야외씬', '로맨틱 야간 씬']
                return ['자연스러운 데이트 스냅', '빈티지 감성', '화사한 세트장']
            }
        },
    ],
    'dress': [
        { key: 'silhouette', label: '선호 실루엣', options: ['벨라인/A라인 (풍성)', '머메이드/슬림 (체형 강조)', '엠파이어/미니 (유니크)'] },
        {
            key: 'material', label: '주요 소재 / 장식', options: () => {
                return ['화려한 맑은 비즈', '우아한 미카도/오간자 실크', '여성스러운 레이스/모티브']
            }
        },
    ],
    'makeup': [
        { key: 'focus', label: '강조 메이크업 포인트', options: ['맑고 투명한 피부/베이스', '입체적인 윤곽/컨투어링', '생기있는 색조/과즙'] },
        { key: 'hair', label: '선호 헤어 연출', options: ['깔끔한 로우번/하이번', '내추럴한 반묶음/웨이브', '우아한 로우 포니테일'] },
    ],
    'snap': [
        { key: 'tone', label: '사진 톤 앤 매너', options: ['화이트/피치 톤 (화사한)', '세피아/웜 톤 (고급스러운)', '블랙 앤 화이트 (시네마틱)'] },
        { key: 'focus', label: '촬영 비중', options: ['신부/신랑 인물 위주 밀착 촬영', '자연스러운 데이트 느낌 스냅', '예식장 배경/전체적인 웅장함 위주'] },
    ],
    'jewelry': [
        { key: 'brand', label: '선호하는 예물샵 타입', options: ['청담/디자이너 샵 (유니크)', '백화점 하이엔드 (명품)', '종로 귀금속 (합리적인 가성비)'] },
        { key: 'budget', label: '예산 범위', options: ['100만원 이하', '100~300만원', '300만원 이상'] },
    ],
    'suit': [
        { key: 'type', label: '예복 준비 방식', options: ['맞춤 예복 (비스포크/수제)', '기성복 (백화점 브랜드 구입)', '촬영/본식용 대여'] },
        { key: 'style', label: '핏/디자인', options: ['클래식 포멀 핏 (투버튼/싱글)', '트렌디 슬림 핏', '더블 브레스티드 (화려함)'] },
    ],
    'hanbok': [
        { key: 'type', label: '필요한 한복 종류', options: ['혼주 한복 (어머니/아버지)', '신부 한복 (폐백/촬영용)', '통합 세트 (혼주+신부)'] },
        { key: 'style', label: '한복 스타일', options: ['전통적인 우아함', '모던/퓨전 감각', '화려한 자수/고급 소재'] },
    ],
    'invitation': [
        { key: 'style', label: '디자인 스타일', options: ['클래식/격식 (전통 서체/금박)', '미니멀/모던 (심플/깔끔)', '감성/일러스트 (수채화/손그림)'] },
    ],
    'pyebaek': [
        { key: 'style', label: '스타일', options: ['전통 격식 (정갈한 상차림)', '모던 퓨전 (깔끔/간소화)', '프리미엄 (고급 식재료)'] },
    ],
    'bouquet': [
        // 꽃의 색상/종류 보다는 샵의 스타일이나 위치가 더 중요하므로 필터 전체 삭제 (사용자 의견 반영)
    ],
}
