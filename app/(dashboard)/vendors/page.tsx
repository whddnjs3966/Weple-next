import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserVendors } from '@/actions/user-vendors'
import VendorClient from '@/components/vendors/VendorClient'

export default async function VendorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('region_sido, region_sigungu, budget_max, style')
        .eq('id', user.id)
        .single()

    const userVendors = await getUserVendors()

    return (
        <VendorClient
            initialVendors={userVendors}
            defaultSido={profile?.region_sido || '서울'}
            defaultSigungu={profile?.region_sigungu || ''}
            budgetMax={profile?.budget_max || 3000}
            style={profile?.style || ''}
        />
    )
}
