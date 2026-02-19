import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * 네이버 OAuth 2.0 인증 시작
 * - 네이버 로그인 페이지로 리다이렉트
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const next = searchParams.get('next') || '/dashboard'

    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    if (!clientId) {
        return NextResponse.json({ error: 'Naver client ID not configured' }, { status: 500 })
    }

    // CSRF 방지용 state 토큰 생성
    const state = crypto.randomBytes(32).toString('hex')

    const callbackUrl = `${new URL(request.url).origin}/api/auth/naver/callback`

    const naverAuthUrl = new URL('https://nid.naver.com/oauth2.0/authorize')
    naverAuthUrl.searchParams.set('response_type', 'code')
    naverAuthUrl.searchParams.set('client_id', clientId)
    naverAuthUrl.searchParams.set('redirect_uri', callbackUrl)
    naverAuthUrl.searchParams.set('state', state)

    // NextResponse 객체에 직접 쿠키 설정 (모바일 브라우저 호환성)
    // cookies() API + redirect 조합은 일부 모바일 브라우저에서 쿠키 누락 가능
    const response = NextResponse.redirect(naverAuthUrl.toString())

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 10, // 10분
        path: '/',
    }
    response.cookies.set('naver_oauth_state', state, cookieOptions)
    response.cookies.set('naver_oauth_next', next, cookieOptions)

    return response
}
