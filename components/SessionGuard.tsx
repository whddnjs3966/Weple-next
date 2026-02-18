'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SessionGuard() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            // 세션이 없으면 Supabase Auth 로그아웃 처리
            if (!session) {
                await supabase.auth.signOut()
            }
        }

        checkSession()
    }, [supabase, router])

    return null
}
