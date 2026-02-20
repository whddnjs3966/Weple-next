'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SessionGuard() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // AUTH_TOKEN_CHANGED 이벤트 감지: 로그아웃 또는 토큰 만료 시 리다이렉트
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                router.push('/login')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, router])

    return null
}
