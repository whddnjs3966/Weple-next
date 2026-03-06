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

    // ── API/auth 라우트는 DB 조회 없이 통과 ──
    if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
        return supabaseResponse
    }

    // ── 미인증 유저: 보호된 경로 접근 시 /login으로 리다이렉트 ──
    const isPublicPage =
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname === '/' ||
        pathname.startsWith('/naver') ||
        pathname.startsWith('/sitemap.xml') ||
        pathname.startsWith('/robots.txt')

    if (!user) {
        if (!isPublicPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('next', pathname)
            return NextResponse.redirect(url)
        }
        // 비인증 + 공개 페이지 → DB 조회 없이 바로 통과
        return supabaseResponse
    }

    // ── 인증된 유저 ──
    const isOnboarding = pathname.startsWith('/onboarding')

    // 온보딩 페이지에 있으면 DB 조회 없이 통과 (온보딩 중이니까)
    if (isOnboarding) {
        return supabaseResponse
    }

    // 공개 페이지 또는 보호된 페이지 → 온보딩 완료 여부 확인 (DB 조회 1회)
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('wedding_date')
        .eq('id', user.id)
        .single()

    const hasCompletedOnboarding = profile && profile.wedding_date

    if (isPublicPage) {
        // 인증 + 공개 페이지 → 대시보드 또는 온보딩으로 리다이렉트
        const targetPath = hasCompletedOnboarding ? '/dashboard' : '/onboarding'
        if (pathname === targetPath) return supabaseResponse

        const url = request.nextUrl.clone()
        url.pathname = targetPath
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, { ...cookie })
        })
        return redirectResponse
    }

    // 보호된 페이지인데 온보딩 미완료 → /onboarding으로 리다이렉트
    if (!hasCompletedOnboarding) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, { ...cookie })
        })
        return redirectResponse
    }

    return supabaseResponse
}
