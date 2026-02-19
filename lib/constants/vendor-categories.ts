export const CATEGORIES = [
    { slug: 'wedding-hall', label: '예식장', emoji: '🏛️' },
    { slug: 'studio', label: '스튜디오', emoji: '📸' },
    { slug: 'dress', label: '드레스', emoji: '👗' },
    { slug: 'makeup', label: '메이크업', emoji: '💄' },
    { slug: 'meeting-place', label: '상견례', emoji: '🍽️' },
    { slug: 'hanbok', label: '한복', emoji: '👘' },
    { slug: 'wedding-band', label: '웨딩밴드', emoji: '🎵' },
    { slug: 'honeymoon', label: '신혼여행', emoji: '✈️' },
]

export type CategoryFilter = {
    key: string
    label: string
    options: string[]
}

export const CATEGORY_FILTERS: Record<string, CategoryFilter[]> = {
    'wedding-hall': [
        { key: 'scale', label: '규모', options: ['소규모 (~100명)', '중규모 (100~300명)', '대규모 (300명~)'] },
        { key: 'mood', label: '분위기', options: ['모던', '클래식', '가든/야외', '럭셔리'] },
        { key: 'price', label: '가격대', options: ['2,000만원 이하', '2,000~4,000만원', '4,000만원 이상'] },
    ],
    'studio': [
        { key: 'style', label: '촬영 스타일', options: ['자연광', '실내 스튜디오', '야외', '복합'] },
        { key: 'mood', label: '분위기', options: ['빈티지', '트렌디', '클래식', '감성적'] },
        { key: 'price', label: '가격대', options: ['100만원 이하', '100~200만원', '200만원 이상'] },
    ],
    'dress': [
        { key: 'silhouette', label: '실루엣', options: ['볼가운', 'A라인', '머메이드', '미니'] },
        { key: 'style', label: '스타일', options: ['로맨틱', '모던', '빈티지', '심플'] },
        { key: 'price', label: '가격대', options: ['100만원 이하', '100~300만원', '300만원 이상'] },
    ],
    'makeup': [
        { key: 'style', label: '메이크업 스타일', options: ['내추럴', '글램', '로맨틱', '유럽풍'] },
        { key: 'mood', label: '톤', options: ['청순한', '화려한', '우아한'] },
        { key: 'price', label: '가격대', options: ['50만원 이하', '50~100만원', '100만원 이상'] },
    ],
    'meeting-place': [
        { key: 'cuisine', label: '음식 종류', options: ['한식', '양식', '일식', '중식'] },
        { key: 'mood', label: '분위기', options: ['조용한 룸', '모던 캐주얼', '고급 레스토랑'] },
        { key: 'price', label: '1인 가격대', options: ['5만원 이하', '5~10만원', '10만원 이상'] },
    ],
    'hanbok': [
        { key: 'style', label: '스타일', options: ['전통', '개량', '퓨전'] },
        { key: 'mood', label: '분위기', options: ['화사한', '단아한', '모던'] },
        { key: 'price', label: '가격대', options: ['50만원 이하', '50~150만원', '150만원 이상'] },
    ],
    'wedding-band': [
        { key: 'type', label: '구성', options: ['듀오', '트리오', '풀밴드'] },
        { key: 'genre', label: '음악 장르', options: ['팝', '재즈', '클래식', '혼합'] },
        { key: 'price', label: '가격대', options: ['100만원 이하', '100~200만원', '200만원 이상'] },
    ],
    'honeymoon': [
        { key: 'destination', label: '여행지', options: ['동남아', '유럽', '일본', '몰디브/하와이'] },
        { key: 'duration', label: '기간', options: ['3~5일', '6~7일', '8일 이상'] },
        { key: 'price', label: '가격대', options: ['200만원 이하', '200~400만원', '400만원 이상'] },
    ],
}
