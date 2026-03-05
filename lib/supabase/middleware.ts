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
                            // 영구 쿠키: Supabase SDK 기본 maxAge 유지 (브라우저 종료 후에도 로그인 유지)
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

    // ── 인증된 유저 분기 ──
    if (user) {
        // 로그인/회원가입/랜딩 → 프로필 확인 후 적절한 페이지로 리다이렉트
        const isPublicPage =
            pathname.startsWith('/login') ||
            pathname.startsWith('/signup') ||
            pathname === '/'

        // 대시보드 등 보호된 라우트 → 온보딩 미완료 시 /onboarding으로 리다이렉트
        const isProtectedPage =
            !isPublicPage &&
            !pathname.startsWith('/onboarding') &&
            !pathname.startsWith('/api') &&
            !pathname.startsWith('/auth')

        if (isPublicPage || isProtectedPage) {
            // DB에서 프로필 존재 여부 + wedding_date 확인
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id, wedding_date')
                .eq('id', user.id)
                .single()

            const hasCompletedOnboarding = profile && profile.wedding_date

            if (isPublicPage) {
                // wedding_date가 있으면 dashboard, 없거나 profile이 없으면 onboarding
                const targetPath = hasCompletedOnboarding ? '/dashboard' : '/onboarding'

                // 가드: 현재 URL이 이미 대상과 같으면 리다이렉트 중단
                if (pathname === targetPath) return supabaseResponse

                const url = request.nextUrl.clone()
                url.pathname = targetPath

                const redirectResponse = NextResponse.redirect(url)
                const allCookies = supabaseResponse.cookies.getAll()
                allCookies.forEach(cookie => {
                    redirectResponse.cookies.set(cookie.name, cookie.value, {
                        ...cookie,
                    })
                })
                return redirectResponse
            }

            // 보호된 페이지인데 온보딩 미완료 → /onboarding으로 리다이렉트
            if (isProtectedPage && !hasCompletedOnboarding) {
                const url = request.nextUrl.clone()
                url.pathname = '/onboarding'

                const redirectResponse = NextResponse.redirect(url)
                const allCookies = supabaseResponse.cookies.getAll()
                allCookies.forEach(cookie => {
                    redirectResponse.cookies.set(cookie.name, cookie.value, {
                        ...cookie,
                    })
                })
                return redirectResponse
            }
        }
    }

    return supabaseResponse
}
