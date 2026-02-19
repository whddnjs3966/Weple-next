import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'

function stripHtml(str: string): string {
    return str
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}

/**
 * 카테고리별 웨딩 관련 키워드 매핑.
 * 복합 업체(예: 수성호텔)에서 웨딩 관련 리뷰만 필터링하기 위한 키워드.
 */
const CATEGORY_WEDDING_KEYWORDS: Record<string, string[]> = {
    'wedding-hall': ['결혼', '웨딩', '예식', '뷔페', '본식', '신랑', '신부', '하객', '웨딩홀', '예식장', '결혼식'],
    'studio': ['웨딩', '촬영', '스냅', '셀프웨딩', '브라이덜', '웨딩촬영', '결혼', '드레스촬영'],
    'dress': ['웨딩드레스', '드레스', '웨딩', '신부', '결혼', '브라이덜', '본식드레스'],
    'makeup': ['메이크업', '웨딩', '신부', '결혼', '브라이덜', '본식 메이크업'],
    'meeting-place': ['상견례', '양가', '결혼', '웨딩', '첫상견례'],
    'hanbok': ['한복', '전통혼례', '결혼', '웨딩', '신부한복', '혼주한복'],
    'wedding-ring': ['웨딩반지', '결혼반지', '웨딩밴드', '커플링', '예물', '반지', '결혼'],
    'honeymoon': ['신혼여행', '허니문', '결혼', '신혼', '웨딩'],
}

/**
 * 카테고리별 검색 쿼리 접두사.
 * 블로그 검색 시 웨딩 관련 결과가 우선적으로 나오도록 쿼리를 최적화.
 */
const CATEGORY_SEARCH_PREFIX: Record<string, string> = {
    'wedding-hall': '웨딩 결혼식',
    'studio': '웨딩 촬영',
    'dress': '웨딩드레스',
    'makeup': '웨딩 메이크업',
    'meeting-place': '상견례',
    'hanbok': '한복 결혼',
    'wedding-ring': '웨딩반지 예물',
    'honeymoon': '신혼여행',
}

/**
 * 리뷰가 웨딩 관련인지 확인.
 * title 또는 description에 카테고리별 키워드가 하나라도 포함되면 true.
 */
function isWeddingRelated(title: string, description: string, categorySlug: string): boolean {
    const keywords = CATEGORY_WEDDING_KEYWORDS[categorySlug]
    if (!keywords || keywords.length === 0) return true // 키워드 없으면 필터링 안함

    const text = `${title} ${description}`.toLowerCase()
    return keywords.some(kw => text.includes(kw.toLowerCase()))
}

async function getAIModel() {
    if (process.env.ANTHROPIC_API_KEY) {
        try {
            const { anthropic } = await import('@ai-sdk/anthropic')
            return anthropic('claude-haiku-4-5-20251001')
        } catch { /* fallback */ }
    }
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        try {
            const { google } = await import('@ai-sdk/google')
            return google('gemini-2.0-flash')
        } catch { /* ignore */ }
    }
    return null
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || ''
    const categorySlug = searchParams.get('category') || ''

    if (!name) {
        return NextResponse.json({ error: '업체명이 필요합니다.' }, { status: 400 })
    }

    const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    const clientSecret = process.env.NAVER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: 'NAVER API 키가 설정되지 않았습니다.' }, { status: 500 })
    }

    // 카테고리 기반 검색 쿼리 구성 — 웨딩 관련 블로그가 우선 검색되도록
    const searchPrefix = CATEGORY_SEARCH_PREFIX[categorySlug] || '웨딩 후기'
    const query = `${name} ${searchPrefix} 후기`

    // 넉넉히 검색 (필터링 후 6개만 반환하기 위해)
    const res = await fetch(
        `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=12&sort=sim`,
        {
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
            next: { revalidate: 3600 },
        }
    )

    if (!res.ok) {
        return NextResponse.json({ error: '블로그 검색에 실패했습니다.' }, { status: 502 })
    }

    const data = await res.json()

    const allReviews = (data.items || []).map((item: {
        title: string
        description: string
        link: string
        bloggername: string
        postdate: string
    }) => ({
        title: stripHtml(item.title),
        description: stripHtml(item.description),
        link: item.link,
        bloggername: item.bloggername,
        postdate: item.postdate,
    }))

    // 웨딩 관련 리뷰만 필터링 (카테고리가 있을 때)
    let reviews = allReviews
    if (categorySlug) {
        const filtered = allReviews.filter(
            (r: { title: string; description: string }) =>
                isWeddingRelated(r.title, r.description, categorySlug)
        )
        // 필터 후 너무 적으면 원본 유지 (최소한의 결과 보장)
        reviews = filtered.length >= 2 ? filtered : allReviews
    }

    // 최대 6개만 반환
    reviews = reviews.slice(0, 6)

    // AI 리뷰 한줄 요약
    let summary: string | null = null
    if (reviews.length > 0) {
        try {
            const model = await getAIModel()
            if (model) {
                const reviewTexts = reviews
                    .slice(0, 4)
                    .map((r: { title: string; description: string }) => `- ${r.title}: ${r.description}`)
                    .join('\n')

                const { text } = await generateText({
                    model,
                    prompt: `다음은 "${name}"에 대한 블로그 후기입니다:\n${reviewTexts}\n\n이 업체의 전반적인 특징과 분위기를 한국어로 1~2문장으로 요약해주세요. 주요 장단점과 특색을 포함하세요.`,
                    maxOutputTokens: 150,
                })
                summary = text.trim()
            }
        } catch {
            // 요약 실패는 무시 (선택적 기능)
        }
    }

    return NextResponse.json({ reviews, summary })
}
