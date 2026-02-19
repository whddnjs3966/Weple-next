import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            maxAge: undefined,  // 브라우저 종료 시 삭제 (세션 쿠키)
                            expires: undefined, // expires도 제거해야 완전한 세션 쿠키
                        })
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 세션 갱신이 없어 setAll이 호출되지 않은 경우에도
    // 기존 영구 쿠키(maxAge 있는)를 세션 쿠키로 강제 변환
    // → 브라우저 종료 시 반드시 로그인이 해제됨
    request.cookies.getAll()
        .filter(c => c.name.startsWith('sb-'))
        .forEach(({ name, value }) => {
            if (!value) return
            // setAll이 이미 이 쿠키를 처리했으면 건너뜀
            if (supabaseResponse.cookies.get(name)) return
            supabaseResponse.cookies.set(name, value, {
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                // maxAge, expires 없음 → 브라우저 종료 시 자동 삭제
            })
        })

    const pathname = request.nextUrl.pathname

    // ── 미인증 유저: 보호된 경로 접근 시 /login으로 리다이렉트 ──
    if (
        !user &&
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/auth') &&
        !pathname.startsWith('/signup') &&
        !pathname.startsWith('/api') &&
        pathname !== '/'
    ) {
        // 가드: 이미 /login이면 리다이렉트 중단
        if (pathname === '/login') return supabaseResponse

        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // ── 인증된 유저: 로그인/회원가입/랜딩 접근 시 프로필 존재 여부에 따라 분기 ──
    if (user) {
        if (
            pathname.startsWith('/login') ||
            pathname.startsWith('/signup') ||
            pathname === '/'
            // /onboarding은 인증된 유저가 접근해야 하므로 여기서 제외
        ) {
            // DB에서 프로필 존재 여부 + wedding_date 확인
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id, wedding_date')
                .eq('id', user.id)
                .single()

            // wedding_date가 있으면 dashboard, 없거나 profile이 없으면 onboarding
            const targetPath = (profile && profile.wedding_date) ? '/dashboard' : '/onboarding'

            // 가드: 현재 URL이 이미 대상과 같으면 리다이렉트 중단
            if (pathname === targetPath) return supabaseResponse

            const url = request.nextUrl.clone()
            url.pathname = targetPath

            // 리다이렉트 응답 생성 및 쿠키 복사
            const redirectResponse = NextResponse.redirect(url)
            const allCookies = supabaseResponse.cookies.getAll()
            allCookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, {
                    ...cookie,
                    maxAge: undefined,  // 세션 쿠키로 변환
                    expires: undefined, // expires도 제거
                })
            })

            return redirectResponse
        }
    }

    return supabaseResponse
}
