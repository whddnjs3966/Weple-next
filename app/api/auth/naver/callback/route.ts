import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * 네이버 OAuth 2.0 Callback 처리
 * 1. authorization code → access token 교환
 * 2. access token으로 네이버 사용자 정보 조회
 * 3. Supabase Admin API로 사용자 생성/로그인
 * 4. 세션 쿠키 설정 후 리다이렉트
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

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
    const nextPath = cookieStore.get('naver_oauth_next')?.value || '/dashboard'

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

        // 기존 사용자 확인 (이메일로)
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(
            (u) => u.email === naverEmail ||
                u.app_metadata?.provider === 'naver' && u.app_metadata?.naver_id === naverUser.id
        )

        let userId: string

        if (existingUser) {
            userId = existingUser.id
        } else {
            // 신규 유저 생성
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

            if (createError || !newUser.user) {
                console.error('Supabase create user error:', createError)
                return NextResponse.redirect(`${origin}/login?error=naver-create-user-error`)
            }

            userId = newUser.user.id

            // profiles 테이블에 프로필 생성
            await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: naverUser.name || naverUser.nickname || null,
                    avatar_url: naverUser.profile_image || null,
                }, { onConflict: 'id' })
        }

        // 4. 매직 링크 방식으로 세션 생성 (Admin API)
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: naverEmail,
        })

        if (linkError || !linkData) {
            console.error('Generate link error:', linkError)
            return NextResponse.redirect(`${origin}/login?error=naver-session-error`)
        }

        // OTP token + email hash로 세션 교환
        const supabase = await createServerClient()
        const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: linkData.properties?.hashed_token || '',
            type: 'magiclink',
        })

        if (verifyError) {
            console.error('Verify OTP error:', verifyError)
            return NextResponse.redirect(`${origin}/login?error=naver-verify-error`)
        }

        // 5. 프로필 확인 후 리다이렉트
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, wedding_date')
            .eq('id', userId)
            .single()

        if (profile?.wedding_date) {
            return NextResponse.redirect(new URL(nextPath, origin).toString())
        }

        return NextResponse.redirect(new URL('/onboarding', origin).toString())

    } catch (err) {
        console.error('Naver OAuth callback error:', err)
        return NextResponse.redirect(`${origin}/login?error=naver-callback-error`)
    }
}
