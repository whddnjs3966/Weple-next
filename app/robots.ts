import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://wepln.com'

    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/login', '/signup', '/naver*', '/guides'], // Include naver verification files and seo guides
            disallow: ['/dashboard/', '/onboarding/', '/api/', '/auth/'], // Protect private routes
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
