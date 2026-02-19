import { NextRequest, NextResponse } from 'next/server'

const CATEGORY_KEYWORDS: Record<string, string> = {
    'wedding-hall': '웨딩홀',
    'studio': '웨딩스튜디오',
    'dress': '웨딩드레스',
    'makeup': '웨딩메이크업',
    'meeting-place': '상견례식당',
    'hanbok': '한복대여',
    'wedding-band': '웨딩밴드',
    'honeymoon': '신혼여행패키지',
}

// HTML 엔티티 제거 헬퍼
function stripHtml(str: string): string {
    return str
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
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

    const res = await fetch(
        `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=10&sort=comment`,
        {
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
            next: { revalidate: 3600 }, // 1시간 캐싱
        }
    )

    if (!res.ok) {
        return NextResponse.json(
            { error: '네이버 API 요청에 실패했습니다.' },
            { status: 502 }
        )
    }

    const data = await res.json()

    const vendors = (data.items || []).map((item: {
        title: string
        address: string
        roadAddress: string
        telephone: string
        link: string
        category: string
        description: string
    }) => ({
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
