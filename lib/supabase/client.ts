import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'

export function createClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase Environment Variables')
    }

    // @supabase/ssr의 기본 쿠키 기반 저장소를 사용 (영구 세션)
    // 브라우저 종료 후에도 로그인 유지됨 (쿠키에 maxAge 설정)
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
}
