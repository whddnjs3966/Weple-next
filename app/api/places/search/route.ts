import { NextRequest, NextResponse } from 'next/server'

// ──────────────────────────────────────────────────────────────
// 카테고리별 검색 키워드
// 네이버 Local API는 display=5(최대), total도 5건이 한계이므로
// 페이징 대신 **키워드 다양화**로 결과 풀을 극대화한다.
// 키워드마다 완전히 다른 업체가 나오므로 변형이 많을수록 좋다.
// ──────────────────────────────────────────────────────────────
const CATEGORY_QUERIES: Record<string, string[]> = {
    'wedding-hall': [
        '웨딩홀', '예식장', '결혼식장', '웨딩컨벤션',
        '호텔웨딩', '하우스웨딩', '스몰웨딩', '소규모웨딩',
    ],
    'studio': [
        '웨딩스튜디오', '웨딩촬영', '웨딩사진', '결혼사진',
        '브라이덜사진', '사진스튜디오', '촬영스튜디오', '브라이덜스튜디오',
    ],
    'dress': [
        '웨딩드레스', '브라이덜샵', '드레스샵', '웨딩드레스대여',
        '드레스투어', '브라이덜', '결혼드레스',
    ],
    'makeup': [
        '웨딩메이크업', '브라이덜메이크업', '신부메이크업',
        '헤어메이크업', '메이크업샵', '웨딩헤어',
    ],
    'snap': [
        '본식스냅', '웨딩스냅', '결혼식스냅', '결혼스냅',
        '스냅촬영', '본식DVD', '본식촬영', '웨딩영상', '본식영상',
    ],
    'jewelry': [
        '예물', '웨딩밴드', '결혼반지', '웨딩링',
        '예물샵', '웨딩주얼리', '결혼예물',
    ],
    'suit': [
        '남성정장', '웨딩정장', '턱시도대여', '신랑정장',
        '맞춤정장', '예복', '맞춤예복', '테일러샵',
    ],
    'bouquet': [
        '웨딩부케', '본식부케', '부케', '웨딩플라워',
        '꽃집 부케', '웨딩꽃', '플로리스트 웨딩',
    ],
}

// ──────────────────────────────────────────────────────────────
// "서울" 등 광역시/도 단위에서는 네이버 API가 0건을 반환하는 경우가 많으므로
// 대표 하위 지역을 추가 검색하여 결과를 보강한다.
// ──────────────────────────────────────────────────────────────
const SIDO_SUB_REGIONS: Record<string, string[]> = {
    '서울': ['강남', '잠실', '종로', '서초', '마포', '여의도'],
    '경기': ['수원', '분당', '일산', '판교'],
    '인천': ['송도', '부평', '인천시'],
}

// 제외 키워드 (불필요한 공방, 셀프사진관, 학원 등 제거)
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

// 카테고리 관련성 필터 — 네이버 API category 필드 + 장소명 + 설명에서 확인
// 빈 배열이면 필터링하지 않음
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

async function fetchLocal(
    query: string,
    clientId: string,
    clientSecret: string,
): Promise<NaverLocalItem[]> {
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=1&sort=comment`
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

    const rawFilters = searchParams.get('filters') || ''
    const filterKeywords = rawFilters.split(',').map(f => f.trim()).filter(Boolean)

    const keywords = CATEGORY_QUERIES[category] || ['웨딩홀']
    const relevanceKeywords = CATEGORY_RELEVANCE[category] || []
    const region = sigungu || sido

    // ──────────────────────────────────────────────────────────
    // 검색 쿼리 생성 전략:
    // 1) 사용자가 선택한 필터(옵션)가 있으면 적극 활용하여 수십 개의 다채로운 쿼리 생산 (예: "대구 인물위주 스튜디오")
    // 2) 기본 "{지역} {키워드}", 역순 "{키워드} {지역}"
    // 3) 서울/경기/인천은 하위 지역 + 종속 키워드 추가
    // ──────────────────────────────────────────────────────────
    const queries: string[] = []

    for (const kw of keywords) {
        // 필터가 존재하면 우선적으로 필터를 조합한 쿼리를 대량 생성 (정확도 & 다양성 극대화)
        if (filterKeywords.length > 0) {
            for (const fk of filterKeywords) {
                // 제외 필터나 너무 긴 문장은 네이버 API 검색이 안될 수 있지만, 단어 단위 필터는 아주 유효함
                queries.push(`${region} ${fk} ${kw}`)
                queries.push(`${fk} ${kw} ${region}`)
            }
        }
        // 필터가 없거나, 필터 결과가 적을 때를 대비해 기본 쿼리도 추가
        queries.push(`${region} ${kw}`)
    }

    // 역순: keyword + region (네이버 API에서 다른 결과를 반환하는 경우가 많음)
    const reverseKeywords = keywords.slice(0, Math.ceil(keywords.length / 2))
    for (const kw of reverseKeywords) {
        queries.push(`${kw} ${region}`)
    }

    // 하위 지역 보강: 서울/경기/인천 등 광역 단위에서 0건 반환 대비
    const subRegions = SIDO_SUB_REGIONS[sido]
    if (subRegions && !sigungu) {
        const coreKeywords = keywords.slice(0, 3)
        for (const sub of subRegions) {
            for (const kw of coreKeywords) {
                queries.push(`${sub} ${kw}`)
                // 하위 지역 + 필터 조합도 일부 추가
                if (filterKeywords.length > 0) {
                    queries.push(`${sub} ${filterKeywords[0]} ${kw}`)
                }
            }
        }
    }

    // API Rate Limit 방지 및 응답 속도 최적화를 위해 중복 제거 후 최대 25개로 쿼리 제한
    const uniqueQueries = Array.from(new Set(queries)).slice(0, 25)

    // 병렬 요청 (1건/쿼리, 페이징 불필요 — 네이버 Local API는 total≤5)
    console.log(`[Naver Search] Category: ${category}, Queries: ${uniqueQueries.length}`)
    const fetchPromises = uniqueQueries.map(q => fetchLocal(q, clientId, clientSecret))
    const results = await Promise.all(fetchPromises)
    const allItems = results.flat()

    // 중복 제거 (장소명 기준)
    const seen = new Set<string>()
    const unique = allItems.filter(item => {
        const t = stripHtml(item.title)
        if (seen.has(t)) return false
        seen.add(t)
        return true
    })

    // 제외 키워드 필터링
    const extraExcluded = CATEGORY_EXCLUDED[category] || []
    const allExcluded = [...GLOBAL_EXCLUDED, ...extraExcluded]
    const afterExclusion = unique.filter(item => {
        const title = stripHtml(item.title).toLowerCase()
        const cat = item.category.toLowerCase()
        return !allExcluded.some(kw => title.includes(kw.toLowerCase()) || cat.includes(kw.toLowerCase()))
    })

    // 카테고리 관련성 필터링 (느슨한 모드):
    // category 필드 + 장소명 + 설명 중 하나라도 매칭되면 통과
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

    const primaryQuery = `${region} ${keywords[0]}`
    return NextResponse.json({ places, query: primaryQuery })
}
