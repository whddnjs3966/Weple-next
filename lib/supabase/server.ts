import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types/database.types'

export async function createClient() {
    const cookieStore = await cookies()

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase Environment Variables')
    }

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                // SDK 기본 maxAge 유지 → 브라우저 종료 후에도 로그인 유지
                            })
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
