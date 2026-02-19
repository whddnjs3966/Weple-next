import { NextRequest, NextResponse } from 'next/server'

interface NominatimResult {
    lat: string
    lon: string
    display_name: string
}

/**
 * 한국 주소를 지오코딩하기 위한 다단계 전략:
 * 1. 도로명 주소를 정규화하여 Nominatim 검색
 * 2. 실패 시 주소에서 핵심 부분만 추출하여 재시도
 * 3. 최종 실패 시 네이버 지도 링크로 fallback
 */
function normalizeKoreanAddress(address: string): string[] {
    const queries: string[] = []

    // 원본 주소 그대로
    queries.push(address)

    // 괄호 안 내용 제거, 상세주소(층, 호) 제거
    const cleaned = address
        .replace(/\([^)]*\)/g, '')
        .replace(/\d+층/g, '')
        .replace(/\d+호/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    if (cleaned !== address) queries.push(cleaned)

    // "시/도 + 구/군 + 도로명" 패턴 추출
    const roadMatch = address.match(/((?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\s]*\s+[^\s]+(?:구|시|군)\s+[^\s]+(?:로|길)[^\s]*)/);
    if (roadMatch) queries.push(roadMatch[1])

    // "시/도 + 구/군" 만 추출 (넓은 범위)
    const districtMatch = address.match(/((?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\s]*\s+[^\s]+(?:구|시|군))/);
    if (districtMatch) queries.push(districtMatch[1])

    return [...new Set(queries)]
}

async function geocodeWithNominatim(query: string): Promise<NominatimResult | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=kr`
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Weple-Wedding-App/1.0 (contact@weple.kr)',
            },
            next: { revalidate: 86400 },
        })

        if (!res.ok) return null
        const data: NominatimResult[] = await res.json()
        if (!data || data.length === 0) return null
        return data[0]
    } catch {
        return null
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address') || ''

    if (!address) {
        return NextResponse.json({ error: 'address required' }, { status: 400 })
    }

    // 다단계 시도
    const queries = normalizeKoreanAddress(address)

    for (const query of queries) {
        const result = await geocodeWithNominatim(query)
        if (result) {
            return NextResponse.json({
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                displayName: result.display_name,
            })
        }
    }

    // 모든 시도 실패 — 클라이언트에서 네이버 지도 링크로 fallback 처리
    return NextResponse.json(
        { error: '주소를 찾을 수 없습니다.', fallback: true },
        { status: 404 }
    )
}
