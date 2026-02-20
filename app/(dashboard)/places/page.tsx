import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPlaces } from '@/actions/user-places'
import PlaceClient from '@/components/places/PlaceClient'

export default async function PlacePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('region_sido, region_sigungu, budget_max, style')
        .eq('id', user.id)
        .single()

    const userPlaces = await getUserPlaces()

    return (
        <PlaceClient
            initialPlaces={userPlaces}
            defaultSido={profile?.region_sido || '서울'}
            defaultSigungu={profile?.region_sigungu || ''}
            budgetMax={profile?.budget_max || 3000}
            style={profile?.style || ''}
        />
    )
}
