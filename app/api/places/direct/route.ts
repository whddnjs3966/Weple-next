import { NextRequest, NextResponse } from 'next/server'

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

function stripHtml(str: string): string {
    return str
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}

// 제외 키워드
const GLOBAL_EXCLUDED = ['공방', '셀프', '클래스', '원데이', '수강', '레슨', '체험', '취미', 'DIY', '만들기', '교실', '학원', '강좌', '아카데미']
const CATEGORY_EXCLUDED: Record<string, string[]> = {
    'jewelry': ['반지공방', '커플링체험', '실버', '은반지', '체험공방', '우드링'],
    'studio': ['셀프사진관', '포토부스', '증명사진', '여권사진', '인생네컷'],
    'dress': ['한복대여', '코스프레', '파티의상', '파티룸', '셀프스튜디오'],
    'makeup': ['네일', '왁싱', '반영구', '피부과', '에스테틱', '올리브영', '롯데마트'],
    'suit': ['세탁', '수선', '클리닝'],
    'bouquet': ['화환', '조화', '조경', '인테리어'],
    'snap': ['셀프사진관', '포토부스', '증명사진'],
    'wedding-hall': ['장례', '연습실', '세미나', '장례식장', '포차'],
}

// 카테고리 관련성 필터
const CATEGORY_RELEVANCE: Record<string, string[]> = {
    'wedding-hall': ['웨딩', '예식', '컨벤션', '호텔', '연회', '홀', '채플', '결혼', '하우스', '가든', '뷔페'],
    'studio': ['사진', '스튜디오', '촬영', '영상', '포토', '웨딩', '브라이덜', '브라이달'],
    'dress': ['웨딩', '드레스', '의류', '의상', '브라이덜', '브라이달', '샵'],
    'makeup': ['미용', '메이크업', '뷰티', '헤어', '웨딩', '살롱', '브라이덜'],
    'snap': ['사진', '스냅', '촬영', '웨딩', '결혼', '영상', '스튜디오', 'dvd'],
    'jewelry': ['보석', '귀금속', '주얼리', '쥬얼리', '반지', '예물', '다이아'],
    'suit': ['테일러', '맞춤', '정장', '의류', '양복', '예복', '턱시도', '가먼트', '수트'],
    'bouquet': ['꽃', '화원', '플라워', '부케', '식물', '플로리스트', '가든'],
}

// 카테고리별 병합 검색용 키워드
const CATEGORY_QUERIES: Record<string, string[]> = {
    'wedding-hall': ['웨딩홀', '예식장', '결혼식장'],
    'studio': ['스튜디오', '사진관', '웨딩촬영'],
    'dress': ['드레스샵', '웨딩드레스', '브라이덜'],
    'makeup': ['메이크업', '웨딩메이크업', '미용실'],
    'snap': ['본식스냅', '웨딩스냅', '영상'],
    'jewelry': ['예물', '웨딩밴드', '결혼반지'],
    'suit': ['맞춤정장', '예복', '테일러'],
    'bouquet': ['부케', '꽃집', '플라워'],
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const region = searchParams.get('region') || ''
    const category = searchParams.get('category')

    if (!query) {
        return NextResponse.json({ error: '검색어를 입력해주세요.' }, { status: 400 })
    }

    const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    const clientSecret = process.env.NAVER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.' },
            { status: 500 }
        )
    }

    const queriesToTry: string[] = []
    const baseQuery = region ? `${region} ${query}` : query
    queriesToTry.push(baseQuery)

    // 카테고리가 있으면 카테고리 키워드를 조합하여 검색의 정확도를 높인다.
    // 예: "수성" -> "대구 수성", "대구 수성 웨딩홀", "대구 수성 예식장" 등
    if (category && CATEGORY_QUERIES[category]) {
        queriesToTry.push(`${baseQuery} ${CATEGORY_QUERIES[category][0]}`)
        queriesToTry.push(`${baseQuery} ${CATEGORY_QUERIES[category][1]}`)
    }

    try {
        const fetchPromises = queriesToTry.map(async (q) => {
            const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(q)}&display=5&start=1&sort=random`
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
        })

        const resultsArray = await Promise.all(fetchPromises)
        const allItems: NaverLocalItem[] = resultsArray.flat()

        if (allItems.length === 0) {
            return NextResponse.json({ places: [] })
        }

        // 중복 제거 (title + address 기준)
        const uniqueItems: NaverLocalItem[] = []
        const seen = new Set<string>()
        for (const item of allItems) {
            const key = `${stripHtml(item.title)}|${item.address}`
            if (!seen.has(key)) {
                seen.add(key)
                uniqueItems.push(item)
            }
        }

        const extraExcluded = category && CATEGORY_EXCLUDED[category] ? CATEGORY_EXCLUDED[category] : []
        const allExcluded = [...GLOBAL_EXCLUDED, ...extraExcluded]
        const afterExclusion = uniqueItems.filter(item => {
            const title = stripHtml(item.title).toLowerCase()
            const cat = item.category.toLowerCase()
            return !allExcluded.some(kw => title.includes(kw.toLowerCase()) || cat.includes(kw.toLowerCase()))
        })

        const relevanceKeywords = category && CATEGORY_RELEVANCE[category] ? CATEGORY_RELEVANCE[category] : []
        const filtered = relevanceKeywords.length > 0
            ? afterExclusion.filter(item => {
                const cat = item.category.toLowerCase()
                const title = stripHtml(item.title).toLowerCase()
                const desc = item.description.toLowerCase()
                return relevanceKeywords.some(kw =>
                    cat.includes(kw) || title.includes(kw) || desc.includes(kw)
                )
            })
            : afterExclusion

        const places = filtered.map(item => ({
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

        // 검색어가 상호명(title)에 포함되지 않고 주소에만 포함된 경우 제거
        const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean)
        const meaningfulTokens = queryTokens.filter(t => t.length >= 2)

        const titleFilteredPlaces = places.filter(place => {
            const titleLower = place.title.toLowerCase()
            const titleNoSpace = titleLower.replace(/\s+/g, '')
            const queryNoSpace = query.toLowerCase().replace(/\s+/g, '')

            // 1. 공백 무시하고 검색어 전체가 포함된 경우
            if (titleNoSpace.includes(queryNoSpace)) return true

            // 2. 검색어의 의미 있는 단어(2글자 이상) 중 하나라도 상호명에 포함된 경우
            if (meaningfulTokens.length > 0) {
                return meaningfulTokens.some(token => titleNoSpace.includes(token))
            }

            // 3. 1글자 단어들만 있는 경우
            return queryTokens.some(token => titleNoSpace.includes(token))
        })

        // 검색어와 일치하는 결과(순수 쿼리에 등장하는 상호명)를 우선 정렬
        const sortedPlaces = titleFilteredPlaces.sort((a, b) => {
            const aTitle = a.title.toLowerCase()
            const bTitle = b.title.toLowerCase()
            const q = query.toLowerCase()

            const aHasExact = aTitle.includes(q)
            const bHasExact = bTitle.includes(q)

            if (aHasExact && !bHasExact) return -1
            if (!aHasExact && bHasExact) return 1
            return 0
        })

        return NextResponse.json({ places: sortedPlaces })

    } catch (error) {
        console.error('Direct search error:', error)
        return NextResponse.json({ error: '검색 중 오류가 발생했습니다.' }, { status: 500 })
    }
}
