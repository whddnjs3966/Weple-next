import { NextRequest, NextResponse } from 'next/server'

// 카테고리별 복수 검색 키워드 — 하나의 키워드로는 네이버 Local API 결과가 5건 미만일 수 있으므로
// 여러 키워드를 병렬 검색하여 결과 풀을 넓힘
const CATEGORY_QUERIES: Record<string, string[]> = {
    'wedding-hall': ['웨딩홀', '예식장', '웨딩컨벤션', '결혼식장'],
    'studio': ['웨딩스튜디오', '웨딩촬영', '브라이덜사진'],
    'dress': ['웨딩드레스', '브라이덜샵', '웨딩드레스대여'],
    'makeup': ['웨딩메이크업', '브라이덜메이크업', '웨딩헤어메이크업'],
    'snap': ['본식스냅', '웨딩스냅', '결혼식스냅'],
    'jewelry': ['예물', '웨딩밴드', '결혼반지', '웨딩링'],
    'suit': ['맞춤정장', '예복', '맞춤예복', '테일러샵'],
    'bouquet': ['웨딩부케', '본식부케', '맞춤부케'],
}

// 네이버 category 필드 기반 필터링 키워드
// 검색 결과 중 해당 카테고리에 맞지 않는 장소를 걸러냄
const CATEGORY_FILTERS: Record<string, string[]> = {
    'wedding-hall': ['웨딩', '예식', '컨벤션', '호텔', '연회', '홀', '채플', '결혼'],
    'studio': ['사진', '스튜디오', '촬영', '영상', '포토', '웨딩'],
    'dress': ['웨딩', '드레스', '의류', '의상', '브라이덜', '브라이달'],
    'makeup': ['미용', '메이크업', '뷰티', '헤어', '웨딩'],
    'snap': ['사진', '스냅', '촬영', '웨딩', '결혼'],
    'jewelry': ['보석', '귀금속', '주얼리', '쥬얼리', '반지', '예물', '다이아'],
    'suit': ['테일러', '맞춤', '정장', '의류', '양복', '예복'],
    'bouquet': ['꽃', '화원', '플라워', '부케', '식물'],
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

    // 중복 제거 (장소명 기준)
    const seen = new Set<string>()
    const unique = allItems.filter(item => {
        const t = stripHtml(item.title)
        if (seen.has(t)) return false
        seen.add(t)
        return true
    })

    // 제외 키워드 필터링 (불필요한 공방, 셀프사진관 등 제거)
    const GLOBAL_EXCLUDED = ['공방', '셀프', '클래스', '원데이', '수강', '레슨', '체험', '취미', 'DIY', '만들기', '교실', '학원', '강좌']
    const CATEGORY_EXCLUDED: Record<string, string[]> = {
        'jewelry': ['반지공방', '커플링체험', '실버', '은반지', '체험공방', '우드링'],
        'studio': ['셀프사진관', '포토부스', '증명사진', '여권사진', '인생네컷'],
        'dress': ['한복대여', '코스프레', '파티의상'],
        'makeup': ['네일', '왁싱', '반영구', '피부과', '에스테틱'],
        'suit': ['세탁', '수선', '클리닝'],
        'bouquet': ['화환', '조화', '조경', '인테리어'],
        'snap': ['셀프사진관', '포토부스', '증명사진'],
        'wedding-hall': ['장례', '연습실', '세미나'],
    }
    const extraExcluded = CATEGORY_EXCLUDED[category] || []
    const allExcluded = [...GLOBAL_EXCLUDED, ...extraExcluded]
    const uniqueFiltered = unique.filter(item => {
        const title = stripHtml(item.title).toLowerCase()
        const cat = item.category.toLowerCase()
        return !allExcluded.some(kw => title.includes(kw.toLowerCase()) || cat.includes(kw.toLowerCase()))
    })

    // 카테고리 관련성 필터링: 네이버 category 필드 + 장소명 + 설명에서 관련 키워드 확인
    const filtered = filterKeywords.length > 0
        ? uniqueFiltered.filter(item => {
            const cat = item.category.toLowerCase()
            const title = stripHtml(item.title).toLowerCase()
            const desc = item.description.toLowerCase()
            return filterKeywords.some(kw =>
                cat.includes(kw) || title.includes(kw) || desc.includes(kw)
            )
        })
        : uniqueFiltered

    // 결과 셔플 → 매번 다른 순서로 표시
    const places = shuffle(filtered).map(item => ({
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

    return NextResponse.json({ places, query: primaryQuery })
}
