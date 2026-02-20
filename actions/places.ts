'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

export type Place = Database['public']['Tables']['places']['Row'] & {
    category: Database['public']['Tables']['place_categories']['Row'] | null
}

export type Category = Database['public']['Tables']['place_categories']['Row']

export async function getPlaceCategories() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('place_categories')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }
    return data
}

export async function getPlaces(params?: { category?: string; region?: string }) {
    const supabase = await createClient()
    let query = supabase
        .from('places')
        .select(`
      *,
      category:place_categories(*)
    `)
        .order('rating', { ascending: false })

    if (params?.category) {
        // Filter by category slug via join is tricky in simple query, 
        // better to filter by category_id if we had it, or use !inner join.
        // Let's rely on the fact that we might need to filter by category slug.
        // Supabase standard join filter:
        query = query.eq('category.slug', params.category)
        // Note: This requires the relationship to be set up correctly in Supabase.
    }

    if (params?.region) {
        // Basic search for region in address or region fields
        query = query.or(`region_sido.ilike.%${params.region}%,region_sigungu.ilike.%${params.region}%,address.ilike.%${params.region}%`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching places:', error)
        return []
    }

    // Client-side filtering for category slug if the join filter above has issues
    // (Supabase join filtering syntax can be complex)
    let filteredData = data as Place[]
    if (params?.category) {
        filteredData = filteredData.filter(v => v.category?.slug === params.category)
    }

    return filteredData
}

export async function getPlaceById(id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('places')
        .select(`
      *,
      category:place_categories(*)
    `)
        .eq('id', id)
        .single()

    if (error) {
        return null
    }
    return data as Place
}
