import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'
import { sessionAdapter } from './storage'

export function createClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase Environment Variables')
    }

    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                storage: sessionAdapter,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        }
    )
}
