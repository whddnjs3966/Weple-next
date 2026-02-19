import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'

export function createClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase Environment Variables')
    }

    // @supabase/ssr의 기본 쿠키 기반 저장소를 사용
    // 세션 쿠키(브라우저 종료 시 삭제)는 미들웨어에서 maxAge/expires 제거로 처리
    // 커스텀 sessionStorage를 사용하면 모바일 OAuth PKCE flow가 깨짐
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
}
