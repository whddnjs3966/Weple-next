import { getPost } from '@/actions/community'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import WritePostForm from '@/components/community/WritePostForm'

export default async function EditPostPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [post, { data: profile }] = await Promise.all([
        getPost(id),
        supabase.from('profiles').select('role').eq('id', user.id).single()
    ])

    if (!post) return notFound()

    const canEdit = post.user_id === user.id || profile?.role === 'admin'

    if (!canEdit) {
        redirect(`/community/${id}`)
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <WritePostForm role={profile?.role || undefined} initialData={post} />
        </div>
    )
}
