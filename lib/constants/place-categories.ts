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
        { key: 'scale', label: '예식 규모', options: ['스몰웨딩 (50명 이하)', '중소규모 (50~150명)', '대규모 (200명 이상)'] },
        { key: 'type', label: '홀 타입', options: ['호텔 웨딩', '컨벤션/연회장', '하우스/가든', '채플/성당'] },
        { key: 'budget', label: '예산 (1인 식대)', options: ['5만원 이하', '5~8만원', '8만원 이상'] },
    ],
    'studio': [
        { key: 'style', label: '촬영 스타일', options: ['클래식/심플', '자연광/감성', '다양한 세트장'] },
        { key: 'budget', label: '예산', options: ['100만원 이하', '100~200만원', '200만원 이상'] },
    ],
    'dress': [
        { key: 'type', label: '준비 방식', options: ['드레스 구매', '드레스 대여', '구매+대여 모두'] },
        { key: 'budget', label: '예산', options: ['100만원 이하', '100~300만원', '300만원 이상'] },
    ],
    'makeup': [
        { key: 'budget', label: '예산', options: ['30만원 이하', '30~70만원', '70만원 이상'] },
    ],
    'snap': [
        { key: 'type', label: '촬영 유형', options: ['본식스냅 사진', '본식 영상/DVD', '사진+영상 패키지'] },
        { key: 'budget', label: '예산', options: ['50만원 이하', '50~100만원', '100만원 이상'] },
    ],
    'jewelry': [
        { key: 'brand', label: '예물샵 타입', options: ['청담/디자이너 (유니크)', '백화점 (하이엔드)', '종로 귀금속 (가성비)'] },
        { key: 'budget', label: '예산', options: ['100만원 이하', '100~300만원', '300~500만원', '500만원 이상'] },
    ],
    'suit': [
        { key: 'type', label: '준비 방식', options: ['맞춤 제작', '기성복 구매', '대여'] },
        { key: 'budget', label: '예산', options: ['50만원 이하', '50~100만원', '100만원 이상'] },
    ],
    'hanbok': [
        { key: 'type', label: '한복 종류', options: ['혼주 한복', '신부 한복', '혼주+신부 세트'] },
        { key: 'budget', label: '예산', options: ['50만원 이하', '50~100만원', '100만원 이상'] },
    ],
    'invitation': [
        { key: 'type', label: '청첩장 유형', options: ['실물 청첩장', '모바일 청첩장', '실물+모바일 세트'] },
    ],
    'pyebaek': [
        { key: 'budget', label: '예산', options: ['30만원 이하', '30~50만원', '50만원 이상'] },
    ],
    'bouquet': [],
}
