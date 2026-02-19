import { NextRequest, NextResponse } from 'next/server'

const CATEGORY_KEYWORDS: Record<string, string> = {
    'wedding-hall': '웨딩홀',
    'studio': '웨딩스튜디오',
    'dress': '웨딩드레스',
    'makeup': '웨딩메이크업',
    'meeting-place': '상견례식당',
    'hanbok': '한복대여',
    'wedding-ring': '웨딩반지',
    'honeymoon': '신혼여행패키지',
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
}

async function fetchPage(
    query: string,
    start: number,
    clientId: string,
    clientSecret: string,
): Promise<NaverLocalItem[]> {
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=${start}&sort=comment`
    const res = await fetch(url, {
        headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
        },
        // cache: 'no-store' — 항상 최신 결과 반환 (캐시 문제 방지)
        cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
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

    const keyword = CATEGORY_KEYWORDS[category] || '웨딩홀'
    const query = sigungu ? `${sigungu} ${keyword}` : `${sido} ${keyword}`

    // Naver Local API: display 최대 5개, start 파라미터로 3페이지 병렬 요청 → 최대 15개
    const pages = await Promise.all([
        fetchPage(query, 1, clientId, clientSecret),
        fetchPage(query, 6, clientId, clientSecret),
        fetchPage(query, 11, clientId, clientSecret),
    ])

    const allItems = pages.flat()

    // 중복 제거 (업체명 기준)
    const seen = new Set<string>()
    const vendors = allItems
        .filter(item => {
            const t = stripHtml(item.title)
            if (seen.has(t)) return false
            seen.add(t)
            return true
        })
        .map(item => ({
            title: stripHtml(item.title),
            address: item.address,
            roadAddress: item.roadAddress,
            telephone: item.telephone,
            link: item.link,
            category: item.category,
            description: item.description,
        }))

    return NextResponse.json({ vendors, query })
}
