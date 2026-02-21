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

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

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

    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=1&sort=random`

    try {
        const res = await fetch(url, {
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            return NextResponse.json({ error: '네이버 검색 API 호출에 실패했습니다.' }, { status: res.status })
        }

        const data = await res.json()
        const items: NaverLocalItem[] = data.items || []

        if (items.length === 0) {
            return NextResponse.json({ places: [] })
        }

        const places = items.map(item => ({
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

        return NextResponse.json({ places })

    } catch (error) {
        console.error('Direct search error:', error)
        return NextResponse.json({ error: '검색 중 오류가 발생했습니다.' }, { status: 500 })
    }
}
