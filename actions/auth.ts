'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOutAction() {
    const supabase = await createClient()
    // 서버에서 signOut → httpOnly 쿠키를 서버가 직접 삭제
    await supabase.auth.signOut()
    redirect('/login')
}
