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
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
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

    // Authenticated User: Redirect to dashboard if trying to access auth pages or landing
    // Check for Supabase user OR NextAuth session
    const isNextAuthUser = request.cookies.has('next-auth.session-token') || request.cookies.has('__Secure-next-auth.session-token')

    if (
        !user &&
        !isNextAuthUser &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/signup') &&
        !request.nextUrl.pathname.startsWith('/api') &&
        request.nextUrl.pathname !== '/'
    ) {
        // no user, potentially respond with 401 or redirect
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Authenticated User: Redirect to dashboard if trying to access auth pages or landing
    // Check for Supabase user OR NextAuth session
    // isNextAuthUser is already declared above

    if (user || isNextAuthUser) {
        if (
            request.nextUrl.pathname.startsWith('/login') ||
            request.nextUrl.pathname.startsWith('/signup') ||
            request.nextUrl.pathname === '/'
        ) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'

            // Create the redirect response
            const redirectResponse = NextResponse.redirect(url)

            // COPY COOKIES from supabaseResponse to redirectResponse
            // This is critical: if we don't do this, the refreshed session cookies are lost,
            // leading to the infinite login loop.
            const allCookies = supabaseResponse.cookies.getAll()
            allCookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
            })

            return redirectResponse
        }
    }

    return supabaseResponse
}
