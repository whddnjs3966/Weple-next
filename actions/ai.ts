'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateText } from 'ai'

const CATEGORY_NAMES: Record<string, string> = {
    'wedding-hall': '웨딩홀',
    'studio': '웨딩스튜디오',
    'dress': '웨딩드레스 샵',
    'makeup': '웨딩 메이크업 샵',
    'meeting-place': '상견례 레스토랑',
    'hanbok': '한복 대여점',
    'wedding-ring': '웨딩반지 전문점',
    'honeymoon': '신혼여행 패키지',
}

/**
 * AI 모델을 가져오는 헬퍼.
 * Anthropic을 우선 시도하고, 실패하면 Google Gemini로 fallback.
 */
async function getAIModel() {
    // Try Anthropic first
    if (process.env.ANTHROPIC_API_KEY) {
        try {
            const { anthropic } = await import('@ai-sdk/anthropic')
            return anthropic('claude-haiku-4-5-20251001')
        } catch (e) {
            console.warn('Anthropic SDK load failed, trying Google:', e)
        }
    }

    // Fallback to Google Gemini
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        try {
            const { google } = await import('@ai-sdk/google')
            return google('gemini-2.0-flash')
        } catch (e) {
            console.warn('Google AI SDK load failed:', e)
        }
    }

    return null
}

export type AiVendorRec = {
    name: string
    reason: string
    priceRange: string
}

export async function recommendVendorsWithFilters(
    category: string,
    filters: Record<string, string>,
    sido: string = '서울',
): Promise<{ recommendations: AiVendorRec[], error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { recommendations: [], error: 'Unauthorized' }

    const categoryName = CATEGORY_NAMES[category] || category

    const filterLines = Object.entries(filters)
        .filter(([, v]) => v)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')

    const prompt = `당신은 한국 웨딩 전문가입니다.
다음 조건에 맞는 ${sido} 지역의 ${categoryName} 업체 3곳을 추천해주세요:
${filterLines || '- 조건 미선택 (일반 추천)'}

실제 존재하는 유명한 업체를 추천하고 특징을 간결하게 설명해주세요.
반드시 다음 JSON 배열 형식으로만 응답하세요 (다른 텍스트 없이):
[{"name":"업체명","reason":"추천 이유 1-2줄","priceRange":"예상 가격대"}]`

    try {
        const model = await getAIModel()
        if (!model) {
            return { error: 'AI API 키가 설정되지 않았습니다. ANTHROPIC_API_KEY 또는 GOOGLE_GENERATIVE_AI_API_KEY를 설정해주세요.', recommendations: [] }
        }

        const { text } = await generateText({
            model,
            prompt,
            maxOutputTokens: 600,
        })
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (!jsonMatch) return { recommendations: [] }
        return { recommendations: JSON.parse(jsonMatch[0]) }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error('AI vendor recommendation error:', msg)
        return { error: `AI 추천 생성에 실패했습니다: ${msg}`, recommendations: [] }
    }
}

export async function recommendVendors(category: string): Promise<{ recommendations: AiVendorRec[], error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { recommendations: [], error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('region_sido, region_sigungu, budget_max, style')
        .eq('id', user.id)
        .single()

    const sido = profile?.region_sido || '서울'
    const sigungu = profile?.region_sigungu || ''
    const budget = profile?.budget_max || 3000
    const style = profile?.style || '클래식'
    const location = sigungu ? `${sido} ${sigungu}` : sido
    const categoryName = CATEGORY_NAMES[category] || category

    const prompt = `당신은 한국 웨딩 전문가입니다.
다음 조건의 커플에게 ${categoryName} 업체 3곳을 추천해주세요:
- 위치: ${location}
- 총 예산: ${budget.toLocaleString()}만원
- 웨딩 스타일: ${style}

실제 존재하는 유명한 업체를 추천하고 특징을 간결하게 설명해주세요.
반드시 다음 JSON 배열 형식으로만 응답하세요 (다른 텍스트 없이):
[{"name":"업체명","reason":"추천 이유 1-2줄","priceRange":"예상 가격대 (예: 500~700만원)"}]`

    try {
        const model = await getAIModel()
        if (!model) {
            return { error: 'AI API 키가 설정되지 않았습니다.', recommendations: [] }
        }

        const { text } = await generateText({
            model,
            prompt,
            maxOutputTokens: 600,
        })

        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (!jsonMatch) return { recommendations: [] }

        const recommendations: AiVendorRec[] = JSON.parse(jsonMatch[0])
        return { recommendations }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error('AI vendor recommendation error:', msg)
        return { error: `AI 추천 생성에 실패했습니다: ${msg}`, recommendations: [] }
    }
}

interface WeddingPlanData {
    weddingDate: string
    budgetRange: number // in 10,000 KRW
    styles: string[]
}

export async function generateWeddingPlan(planData: WeddingPlanData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const totalBudget = planData.budgetRange

    const breakdown = [
        { category: 'venue', title: '웨딩홀 & 식대', amount: Math.floor(totalBudget * 0.50) },
        { category: 'sdm', title: '스드메 (스튜디오/드레스/메이크업)', amount: Math.floor(totalBudget * 0.15) },
        { category: 'honeymoon', title: '신혼여행', amount: Math.floor(totalBudget * 0.20) },
        { category: 'gifts', title: '예물/예단 & 기타', amount: Math.floor(totalBudget * 0.15) },
    ]

    const taskInserts = breakdown.map(item => ({
        user_id: user.id,
        title: `[예산] ${item.title}`,
        d_day: 0,
        estimated_budget: item.amount * 10000,
        is_completed: false
    }))

    const styleTasks = []

    if (planData.styles.includes('Dark')) {
        styleTasks.push({ title: '어두운 홀 투어 (조명/음향 체크)', d_day: 200 })
        styleTasks.push({ title: '캔들/플라워 데코레이션 업체 선정', d_day: 150 })
    }
    if (planData.styles.includes('Garden')) {
        styleTasks.push({ title: '야외 웨딩 베뉴 투어 (우천 대비 확인)', d_day: 200 })
        styleTasks.push({ title: '야외 리허설 촬영 예약', d_day: 150 })
    }

    const commonTasks = [
        { title: '양가 인사 드리기', d_day: 300 },
        { title: '웨딩홀 계약', d_day: 250 },
        { title: '본식 스냅/DVD 예약', d_day: 240 },
        { title: '신혼여행 항공권 예약', d_day: 200 },
        { title: '드레스 투어', d_day: 180 },
    ]

    const allTasks = [...taskInserts, ...styleTasks.map(t => ({
        user_id: user.id,
        title: t.title,
        d_day: t.d_day,
        estimated_budget: 0,
        is_completed: false
    })), ...commonTasks.map(t => ({
        user_id: user.id,
        title: t.title,
        d_day: t.d_day,
        estimated_budget: 0,
        is_completed: false
    }))]

    const { error } = await supabase.from('tasks')
        .insert(allTasks)

    if (error) {
        console.error('AI Plan Gen Error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/checklist')

    return { success: true }
}
