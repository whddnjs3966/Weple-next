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

    try {
        // 1. Update Auth Metadata (User's Name)
        // Typically Supabase Auth metadata is used for user name
        const { error: authError } = await supabase.auth.updateUser({
            data: { first_name: firstName }
        })

        if (authError) throw authError

        // 2. Update Profile & Wedding Date
        // Based on Onboarding, 'wedding_date' is in 'profiles' table
        // We also update 'first_name' in profiles if it exists there to keep sync
        const { error: profileError } = await (supabase
            .from('profiles') as any)
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
        // Fetch invite code from 'wedding_groups' or 'profiles'
        // Assuming profiles -> group_id -> wedding_groups -> invite_code
        // Or specific logic. For now, let's look for it in profiles or a related join.

        // Based on base.html: user.wedding_profile.group.invite_code
        // This implies profiles (join) wedding_groups.

        const { data: profile } = await (supabase
            .from('profiles') as any)
            .select(`
                group_id,
                wedding_groups:group_id (
                    invite_code
                )
            `)
            .eq('id', user.id)
            .single()

        if (profile?.wedding_groups?.invite_code) {
            return { inviteCode: profile.wedding_groups.invite_code }
        }

        return { inviteCode: 'CODE-NOT-FOUND' }
    } catch (error) {
        console.error('Get Invite Code Error:', error)
        return { error: 'Failed to fetch invite code' }
    }
}
