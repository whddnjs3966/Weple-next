import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const xForwardedHost = request.headers.get('x-forwarded-host')
    const origin = xForwardedHost
        ? `${request.headers.get('x-forwarded-proto') || 'https'}://${xForwardedHost}`
        : requestUrl.origin

    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // 1. 현재 유저 정보 가져오기
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // 2. profiles 테이블에서 유저 존재 여부 확인
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, wedding_date')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    // 3. 프로필 존재 + wedding_date 있음 → 기존 유저 → /dashboard
                    if (profile.wedding_date) {
                        return NextResponse.redirect(new URL('/dashboard', origin).toString())
                    }
                    // 4. 프로필 존재 + wedding_date 없음 → 온보딩 미완료 → /onboarding
                    return NextResponse.redirect(new URL('/onboarding', origin).toString())
                }

                // 5. 프로필 없음 → 신규 유저 → 프로필 자동 생성 후 /onboarding
                await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: user.user_metadata?.name || user.user_metadata?.full_name || null,
                    }, { onConflict: 'id' })

                return NextResponse.redirect(new URL('/onboarding', origin).toString())
            }
        }
    }

    // 인증 실패 시 에러 파라미터와 함께 로그인 페이지로 리다이렉트
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
