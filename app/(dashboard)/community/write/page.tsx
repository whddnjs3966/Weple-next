import WritePostForm from '@/components/community/WritePostForm'
import { createClient } from '@/lib/supabase/server'

export default async function CommunityWritePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let role = 'user'
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        role = profile?.role || 'user'
    }

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
            <WritePostForm role={role} />
        </div>
    )
}
