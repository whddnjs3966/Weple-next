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
    // 더 이상 미들웨어 단계에서 데이터베이스(온보딩 완료 여부)를 조회하지 않습니다.
    // 매 요청마다 DB 조회가 들어가면 성능 저하가 극심해지므로, 
    // 온보딩 우회(리다이렉트)는 각 페이지나 Server Component Layout에서 처리하도록 위임합니다.
    return supabaseResponse
}
