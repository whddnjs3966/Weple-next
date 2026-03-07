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

    const [{ slug }, { data: profile }] = await Promise.all([
        params,
        supabase.from('profiles').select('region_sido, budget_max, style').eq('id', user.id).single(),
    ])

    return (
        <CategoryPlaceClient
            slug={slug}
            defaultSido={profile?.region_sido || ''}
            defaultBudget={profile?.budget_max || 0}
            defaultStyle={profile?.style || ''}
        />
    )
}
