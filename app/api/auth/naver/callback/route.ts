import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types/database.types'

/**
 * 네이버 OAuth 2.0 Callback 처리
 * 1. authorization code → access token 교환
 * 2. access token으로 네이버 사용자 정보 조회
 * 3. Supabase Admin API로 사용자 생성/로그인
 * 4. 세션 쿠키 설정 후 리다이렉트
 */
export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const xForwardedHost = request.headers.get('x-forwarded-host')
    const origin = xForwardedHost
        ? `${request.headers.get('x-forwarded-proto') || 'https'}://${xForwardedHost}`
        : requestUrl.origin

    const code = requestUrl.searchParams.get('code')
    const state = requestUrl.searchParams.get('state')
    const error = requestUrl.searchParams.get('error')

    // 에러 처리
    if (error) {
        console.error('Naver OAuth error:', error)
        return NextResponse.redirect(`${origin}/login?error=naver-auth-error`)
    }

    if (!code || !state) {
        return NextResponse.redirect(`${origin}/login?error=naver-missing-params`)
    }

    // CSRF 검증
    const cookieStore = await cookies()
    const savedState = cookieStore.get('naver_oauth_state')?.value
    let nextPath = cookieStore.get('naver_oauth_next')?.value || '/dashboard'
    // Open Redirect 방지
    if (!nextPath.startsWith('/') || nextPath.startsWith('//')) {
        nextPath = '/dashboard'
    }

    if (!savedState || savedState !== state) {
        return NextResponse.redirect(`${origin}/login?error=naver-state-mismatch`)
    }

    // 쿠키 정리
    cookieStore.delete('naver_oauth_state')
    cookieStore.delete('naver_oauth_next')

    try {
        // 1. Authorization Code → Access Token 교환
        const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
                client_secret: process.env.NAVER_CLIENT_SECRET!,
                code,
                state,
            }),
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            console.error('Naver token error:', tokenData)
            return NextResponse.redirect(`${origin}/login?error=naver-token-error`)
        }

        // 2. Access Token으로 네이버 사용자 정보 조회
        const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        })

        const profileData = await profileResponse.json()

        if (profileData.resultcode !== '00') {
            console.error('Naver profile error:', profileData)
            return NextResponse.redirect(`${origin}/login?error=naver-profile-error`)
        }

        const naverUser = profileData.response
        // naverUser: { id, email, name, nickname, profile_image, ... }

        // 3. Supabase Admin Client로 사용자 생성/조회
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // 네이버 이메일로 기존 유저 검색
        const naverEmail = naverUser.email || `naver_${naverUser.id}@naver.placeholder`

        // 기존 사용자 확인: 먼저 신규 생성 시도 → 이미 존재하면 generateLink에서 userId 획득
        let isNewUser = false

        {
            // 신규 유저 생성 시도
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: naverEmail,
                email_confirm: true,
                user_metadata: {
                    full_name: naverUser.name || naverUser.nickname || null,
                    avatar_url: naverUser.profile_image || null,
                    provider: 'naver',
                    naver_id: naverUser.id,
                },
                app_metadata: {
                    provider: 'naver',
                    naver_id: naverUser.id,
                },
            })

            if (createError) {
                if (!(createError.message?.includes('already been registered') || createError.status === 422)) {
                    console.error('Supabase create user error:', createError)
                    return NextResponse.redirect(`${origin}/login?error=naver-create-user-error`)
                }
                // 이미 존재하는 유저 → generateLink에서 user 정보를 가져옴
            } else {
                isNewUser = true
            }
        }

        // 4. 매직 링크 방식으로 세션 생성 (Admin API) — user 정보도 함께 반환됨
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: naverEmail,
        })

        if (linkError || !linkData) {
            console.error('Generate link error:', linkError)
            return NextResponse.redirect(`${origin}/login?error=naver-session-error`)
        }

        const userId = linkData.user.id

        // 4.5 프로필 존재 여부 확인 후 없으면 생성
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single()

        if (!existingProfile) {
            await supabaseAdmin
                .from('profiles')
                .insert({
                    id: userId,
                    full_name: naverUser.name || naverUser.nickname || null,
                    avatar_url: naverUser.profile_image || null,
                })
        }

        // 5. OTP 검증으로 세션 생성 — redirect 응답에 쿠키를 직접 설정
        // cookies() API는 NextResponse.redirect()에 쿠키를 전달하지 못하므로
        // 수동으로 쿠키를 수집하여 redirect 응답에 복사
        const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // cookieStore에도 설정 (후속 쿼리에서 세션 사용 가능)
                            cookieStore.set(name, value, options)
                            // redirect 응답에 복사할 쿠키 저장
                            pendingCookies.push({ name, value, options: options || {} })
                        })
                    },
                },
            }
        )

        const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: linkData.properties?.hashed_token || '',
            type: 'magiclink',
        })

        if (verifyError) {
            console.error('Verify OTP error:', verifyError)
            return NextResponse.redirect(`${origin}/login?error=naver-verify-error`)
        }

        // 6. 프로필 확인 후 리다이렉트 (세션 쿠키 포함)
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, wedding_date')
            .eq('id', userId)
            .single()

        const redirectUrl = profile?.wedding_date
            ? new URL(nextPath, origin).toString()
            : new URL('/onboarding', origin).toString()

        const response = NextResponse.redirect(redirectUrl)

        // verifyOtp에서 설정된 세션 쿠키를 redirect 응답에 복사
        for (const cookie of pendingCookies) {
            response.cookies.set(cookie.name, cookie.value, cookie.options)
        }

        return response

    } catch (err) {
        console.error('Naver OAuth callback error:', err)
        return NextResponse.redirect(`${origin}/login?error=naver-callback-error`)
    }
}
