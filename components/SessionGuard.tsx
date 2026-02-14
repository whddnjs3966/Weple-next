'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SessionGuard() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Check if we have a session in sessionStorage
        // The key format depends on Supabase, usually 'sb-<ref>-auth-token'
        // But since we use a custom adapter, we can check if *any* Supabase key exists
        // or rely on supabase.auth.getSession() which uses the adapter.

        const checkSession = async () => {
            // 1. Check Supabase Session (which uses sessionStorage now)
            const { data: { session } } = await supabase.auth.getSession()

            // 2. If no session found in storage, but we might have lingering cookies
            // Force sign out to ensure clean slate (clears Supabase & NextAuth cookies)
            if (!session) {
                // Determine if we actually need to trigger signOut (avoid infinite loops if already out)
                // We can check if a known cookie exists via document.cookie, but that's hacky.
                // Safest way: Just call signOut. It handles "already logged out" gracefully usually.

                // However, to be cleaner, we only signOut if we are logically "expected" to be logged out
                // or if we want to ensure we are logged out.

                // For NextAuth, we also want to clear its session.
                // We can import signOut from next-auth/react

                const { signOut: nextAuthSignOut } = await import('next-auth/react')

                // Execute both logouts
                await Promise.all([
                    supabase.auth.signOut(),
                    // nextAuthSignOut({ redirect: false }) 
                    // Warning: nextAuthSignOut might trigger page reload/redirect.
                ])

                // If we are on a protected page, the middleware/page logic will redirect us anyway.
            }
        }

        checkSession()
    }, [supabase, router])

    return null
}
