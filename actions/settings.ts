'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const firstName = formData.get('first_name') as string
    const weddingDate = formData.get('wedding_date') as string

    // 서버 사이드 "관리자" 닉네임 차단 (admin role이 아닌 경우)
    if (firstName?.trim() === '관리자') {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return { error: "'관리자'라는 닉네임은 사용할 수 없습니다." }
        }
    }

    try {
        // 1. Update Auth Metadata (User's Name)
        const { error: authError } = await supabase.auth.updateUser({
            data: { first_name: firstName }
        })

        if (authError) throw authError

        // 2. Update Profile & Wedding Date
        // Based on Onboarding, 'wedding_date' is in 'profiles' table
        // We also update 'first_name' in profiles if it exists there to keep sync
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                wedding_date: weddingDate,
                // If profiles table has name or nickname column, update it too.
                // Assuming 'first_name' or similar might represent the user's display name.
                // Let's stick to updating what we verify exists or is safe.
            })
            .eq('id', user.id)

        if (profileError) throw profileError

        revalidatePath('/dashboard')
        revalidatePath('/', 'layout') // Revalidate global layout if name is in navbar

        return { success: true }
    } catch (error) {
        console.error('Update Profile Error:', error)
        return { error: 'Failed to update profile' }
    }
}

export async function getInviteCode() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    try {
        // profiles.invite_code를 우선 반환 (invite.ts와 통일)
        const { data: profile } = await supabase
            .from('profiles')
            .select('invite_code')
            .eq('id', user.id)
            .single()

        if (profile?.invite_code) {
            return { inviteCode: profile.invite_code }
        }

        return { inviteCode: '' }
    } catch (error) {
        console.error('Get Invite Code Error:', error)
        return { error: 'Failed to fetch invite code' }
    }
}
