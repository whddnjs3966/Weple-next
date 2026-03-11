import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://wepln.com'

    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/login', '/signup', '/naver*', '/guides', '/community/', '/places/'], // Public SEO pages
            disallow: ['/dashboard/', '/onboarding/', '/api/', '/auth/', '/admin/', '/community/write', '/community/new'], // Protect private routes
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
