import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPlaces } from '@/actions/user-places'
import { getFeaturedPlaces } from '@/actions/places'
import PlaceClient from '@/components/places/PlaceClient'

export const metadata: Metadata = {
    title: '업체 추천 - AI 맞춤 웨딩 업체',
    description: '지역, 예산, 취향에 맞는 웨딩홀, 스튜디오, 드레스, 메이크업 업체를 AI가 추천해드립니다.',
}

export default async function PlacePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('region_sido, region_sigungu, budget_max, style')
        .eq('id', user.id)
        .single()

    const [userPlaces, featuredPlaces] = await Promise.all([
        getUserPlaces(),
        getFeaturedPlaces(),
    ])

    return (
        <PlaceClient
            initialPlaces={userPlaces}
            defaultSido={profile?.region_sido || '서울'}
            defaultSigungu={profile?.region_sigungu || ''}
            budgetMax={profile?.budget_max || 3000}
            style={profile?.style || ''}
            featuredPlaces={featuredPlaces}
        />
    )
}
