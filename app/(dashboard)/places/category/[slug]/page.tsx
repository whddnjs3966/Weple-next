import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CategoryPlaceClient from '@/components/places/CategoryPlaceClient'

export default async function CategoryPlacePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { slug } = await params

    return <CategoryPlaceClient slug={slug} />
}
