import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CategoryVendorClient from '@/components/vendors/CategoryVendorClient'

export default async function CategoryVendorPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { slug } = await params

    return <CategoryVendorClient slug={slug} />
}
