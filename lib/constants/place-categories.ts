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
        { key: 'price', label: '예산대 (토탈/별도 포함)', options: ['100만원 이하 (가성비)', '100~200만원 (평균)', '200만원 이상 (하이엔드)'] },
    ],
    'dress': [
        { key: 'silhouette', label: '선호 실루엣', options: ['벨라인/A라인 (풍성)', '머메이드/슬림 (체형 강조)', '엠파이어/미니 (유니크)'] },
        {
            key: 'material', label: '주요 소재 / 장식', options: () => {
                return ['화려한 맑은 비즈', '우아한 미카도/오간자 실크', '여성스러운 레이스/모티브']
            }
        },
        { key: 'mood', label: '드레스 투어 샵 분위기', options: ['러블리 & 로맨틱', '단아 & 클래식', '유니크 & 시크'] },
    ],
    'makeup': [
        { key: 'style', label: '기본 무드', options: ['과즙상 (생기있는/러블리)', '투명한 (자연스러운/단아한)', '음영 (또렷한/세미스모키)'] },
        {
            key: 'focus', label: '강조 메이크업 포인트', options: (filters) => {
                if (filters.style === '과즙상 (생기있는/러블리)') return ['사랑스러운 블러셔', '은은한 애교살 글리터', '수분감 있는 립']
                if (filters.style === '음영 (또렷한/세미스모키)') return ['입체적인 컨투어링', '깊이있는 아이 메이크업', '무결점 피부 표현']
                return ['맑고 투명한 베이스', '속눈썹 결 강조', '자연스러운 립']
            }
        },
        { key: 'hair', label: '선호 헤어 연출', options: ['로우번/하이번 (깔끔)', '반묶음/푸는 머리 (내추럴)', '로우 포니테일 (우아)'] },
    ],
    'snap': [
        { key: 'tone', label: '사진 톤 앤 매너', options: ['화이트/피치 톤 (화사하고 맑은)', '세피아/웜 톤 (따뜻하고 고급스러운)', '블랙 앤 화이트 (필름/시네마틱)'] },
        {
            key: 'focus', label: '촬영 비중', options: () => {
                return ['신부/신랑 인물 위주 밀착 촬영', '양가 부모님/하객 자연스러운 표정 위주', '예식장 배경/전체적인 웅장함 위주']
            }
        },
        { key: 'product', label: '상품 구성', options: ['원판+스냅 합본 (데이터형)', '프리미엄 앨범형 (+부모님용 앨범)', '2인 작가 이상 다각도 촬영'] },
    ],
    'jewelry': [
        { key: 'brand', label: '브랜드 선호도', options: ['청담/디자이너 샵 (커스텀/유니크)', '백화점 하이엔드 (명품/시그니처)', '종로 귀금속 (합리적인 가성비)'] },
        {
            key: 'style', label: '디자인 취향', options: (filters) => {
                if (filters.brand === '백화점 하이엔드 (명품/시그니처)') return ['클래식 밴드링', '상징적인 로고 디자인', '하이주얼리 다이아 세팅']
                return ['심플하고 데일리한 밴드', '질감이 돋보이는 텍스쳐', '화려한 다이아몬드 세팅']
            }
        },
        {
            key: 'budget', label: '예산 범위', options: (filters) => {
                if (filters.brand === '백화점 하이엔드 (명품/시그니처)') return ['200~400만원', '400~600만원', '600만원 이상']
                if (filters.brand === '종로 귀금속 (합리적인 가성비)') return ['100만원 이하', '100~200만원', '200만원 이상']
                return ['100~200만원', '200~400만원', '400만원 이상']
            }
        },
    ],
    'suit': [
        { key: 'type', label: '예복 준비 방식', options: ['맞춤 예복 (비스포크/수제)', '기성복 (백화점 브랜드 구입)', '촬영/본식용 대여'] },
        {
            key: 'fabric', label: '선호 원단', options: (filters) => {
                if (filters.type === '기성복 (백화점 브랜드 구입)') return ['이탈리아 프리미엄 원단', '국내 제일모직', '시즌별 혼방 소재']
                return ['탄탄하고 묵직한 영국 원단', '부드럽고 윤택 있는 이태리 원단', '가성비 좋은 국내 원단']
            }
        },
        { key: 'style', label: '핏/디자인', options: ['클래식 포멀 핏 (투버튼/싱글)', '트렌디 슬림 핏', '더블 브레스티드 (화려함)'] },
    ],
    'hanbok': [
        { key: 'type', label: '한복 종류', options: ['혼주 한복 (어머니/아버지)', '신부 한복 (폐백/촬영용)', '신랑 한복'] },
        {
            key: 'style', label: '한복 스타일', options: (filters) => {
                if (filters.type === '신부 한복 (폐백/촬영용)') return ['전통 궁중 한복', '퓨전 한복 (모던/심플)', '화려한 자수/당의']
                return ['단아한 전통 한복', '모던 퓨전 한복', '격식 있는 정장 한복']
            }
        },
        { key: 'method', label: '준비 방식', options: ['맞춤 제작', '대여', '구매 (기성복)'] },
    ],
    'invitation': [
        { key: 'type', label: '청첩장 형태', options: ['종이 청첩장 (인쇄)', '모바일 청첩장', '종이 + 모바일 병행'] },
        {
            key: 'style', label: '디자인 스타일', options: () => {
                return ['클래식/격식 (전통 서체/금박)', '미니멀/모던 (심플/깔끔)', '감성/일러스트 (수채화/손그림)']
            }
        },
        { key: 'budget', label: '예산대', options: ['장당 1,000원 이하', '장당 1,000~3,000원', '장당 3,000원 이상 (프리미엄)'] },
    ],
    'pyebaek': [
        { key: 'type', label: '준비 항목', options: ['폐백 음식 (밤/대추/폐백닭 등)', '이바지 음식 (떡/한과/과일)', '폐백 + 이바지 세트'] },
        {
            key: 'style', label: '스타일', options: () => {
                return ['전통 격식 (정갈한 상차림)', '모던 퓨전 (깔끔/간소화)', '프리미엄 (고급 식재료)']
            }
        },
    ],
    'bouquet': [
        { key: 'color', label: '부케 컬러 포인트', options: ['화이트 & 그린 (순수하고 클래식한)', '파스텔 톤 (피치/핑크 계열 러블리)', '비비드 톤 (레드/퍼플/옐로우 포컬)'] },
        {
            key: 'shape', label: '부케 쉐입', options: () => {
                return ['단정한 라운드/돔 형태', '자연스럽게 흘러내리는 티어드롭', '들꽃 느낌의 내추럴/암쉐입']
            }
        },
        { key: 'flower', label: '선호 꽃 종류', options: ['은방울꽃/카라/백합 (우아함)', '작약/장미/투베로사 (풍성함/향기)', '계절 꽃/믹스 매치 (트렌디)'] },
    ],
}
