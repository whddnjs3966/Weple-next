import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlaceDetail from '@/components/places/PlaceDetail'

export default async function PlaceDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ name?: string; address?: string; phone?: string; link?: string; mapx?: string; mapy?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { slug } = await params
    const { name = '', address = '', phone = '', link = '', mapx = '', mapy = '' } = await searchParams

    return (
        <PlaceDetail
            slug={slug}
            name={name}
            address={address}
            phone={phone}
            link={link}
            mapx={mapx}
            mapy={mapy}
        />
    )
}
