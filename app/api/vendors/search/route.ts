import { NextRequest, NextResponse } from 'next/server'

// 카테고리별 복수 검색 키워드 — 하나의 키워드로는 네이버 Local API 결과가 5건 미만일 수 있으므로
// 여러 키워드를 병렬 검색하여 결과 풀을 넓힘
const CATEGORY_QUERIES: Record<string, string[]> = {
    'wedding-hall': ['웨딩홀', '예식장', '웨딩컨벤션', '결혼식장'],
    'studio': ['웨딩스튜디오', '웨딩촬영', '브라이덜사진'],
    'dress': ['웨딩드레스', '브라이덜샵', '웨딩드레스대여'],
    'makeup': ['웨딩메이크업', '브라이덜메이크업', '웨딩헤어메이크업'],
    'meeting-place': ['상견례식당', '상견례레스토랑', '상견례맛집'],
    'hanbok': ['한복대여', '혼주한복', '웨딩한복'],
    'wedding-ring': ['웨딩반지', '예물반지', '커플링'],
    'honeymoon': ['신혼여행패키지', '허니문여행사', '신혼여행'],
}

// 네이버 category 필드 기반 필터링 키워드
// 검색 결과 중 해당 카테고리에 맞지 않는 업체를 걸러냄
const CATEGORY_FILTERS: Record<string, string[]> = {
    'wedding-hall': ['웨딩', '예식', '컨벤션', '호텔', '연회', '홀', '채플', '결혼'],
    'studio': ['사진', '스튜디오', '촬영', '영상', '포토', '웨딩'],
    'dress': ['웨딩', '드레스', '의류', '의상', '브라이덜', '브라이달'],
    'makeup': ['미용', '메이크업', '뷰티', '헤어', '웨딩'],
    'meeting-place': ['음식점', '한식', '중식', '일식', '양식', '레스토랑', '식당', '뷔페', '카페'],
    'hanbok': ['한복', '의류', '의상', '전통', '대여', '웨딩'],
    'wedding-ring': ['보석', '귀금속', '주얼리', '쥬얼리', '반지', '예물', '금은', '다이아'],
    'honeymoon': ['여행', '관광', '항공', '투어', '리조트', '허니문'],
}

function stripHtml(str: string): string {
    return str
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}

interface NaverLocalItem {
    title: string
    address: string
    roadAddress: string
    telephone: string
    link: string
    category: string
    description: string
    mapx: string
    mapy: string
}

async function fetchPage(
    query: string,
    start: number,
    clientId: string,
    clientSecret: string,
): Promise<NaverLocalItem[]> {
    // Naver Local API: display 최대 5건, sort=comment(리뷰순)으로 페이징 정상 작동
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=${start}&sort=comment`
    const res = await fetch(url, {
        headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
        },
        cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
}

// Fisher-Yates 셔플
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'wedding-hall'
    const sido = searchParams.get('sido') || '서울'
    const sigungu = searchParams.get('sigungu') || ''

    const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    const clientSecret = process.env.NAVER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.' },
            { status: 500 }
        )
    }

    const keywords = CATEGORY_QUERIES[category] || ['웨딩홀']
    const filterKeywords = CATEGORY_FILTERS[category] || []
    const region = sigungu || sido

    // 키워드별로 3페이지씩 병렬 요청 → 키워드 4개 × 3페이지 × 5건 = 최대 60건
    const fetchPromises = keywords.flatMap(keyword => {
        const query = `${region} ${keyword}`
        return [
            fetchPage(query, 1, clientId, clientSecret),
            fetchPage(query, 6, clientId, clientSecret),
            fetchPage(query, 11, clientId, clientSecret),
        ]
    })

    const pages = await Promise.all(fetchPromises)
    const allItems = pages.flat()

    const primaryQuery = `${region} ${keywords[0]}`

    console.log(`[vendor-search] category="${category}" region="${region}" | 키워드 ${keywords.length}개 × 3페이지 | 전체: ${allItems.length}건`)

    // 중복 제거 (업체명 기준)
    const seen = new Set<string>()
    const unique = allItems.filter(item => {
        const t = stripHtml(item.title)
        if (seen.has(t)) return false
        seen.add(t)
        return true
    })

    console.log(`[vendor-search] 중복 제거 후: ${unique.length}건`)

    // 카테고리 관련성 필터링: 네이버 category 필드 + 업체명 + 설명에서 관련 키워드 확인
    const filtered = filterKeywords.length > 0
        ? unique.filter(item => {
            const cat = item.category.toLowerCase()
            const title = stripHtml(item.title).toLowerCase()
            const desc = item.description.toLowerCase()
            return filterKeywords.some(kw =>
                cat.includes(kw) || title.includes(kw) || desc.includes(kw)
            )
        })
        : unique

    console.log(`[vendor-search] 카테고리 필터 후: ${filtered.length}건`)

    // 결과 셔플 → 매번 다른 순서로 표시
    const vendors = shuffle(filtered).map(item => ({
        title: stripHtml(item.title),
        address: item.address,
        roadAddress: item.roadAddress,
        telephone: item.telephone,
        link: item.link,
        category: item.category,
        description: item.description,
        mapx: item.mapx,
        mapy: item.mapy,
    }))

    return NextResponse.json({ vendors, query: primaryQuery })
}
