import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://wepln.com'
    const supabase = createAdminClient()

    // 정적 페이지
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/guides`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
    ]

    // 커뮤니티 게시글 (공개 게시글)
    const { data: posts } = await supabase
        .from('posts')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(500)

    const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
        url: `${baseUrl}/community/${post.id}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    // 업체 상세 페이지
    const { data: places } = await supabase
        .from('places')
        .select('id, created_at')
        .order('rating', { ascending: false })
        .limit(1000)

    const placePages: MetadataRoute.Sitemap = (places || []).map((place) => ({
        url: `${baseUrl}/places/${place.id}`,
        lastModified: new Date(place.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...staticPages, ...postPages, ...placePages]
}
