import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://wepln.com'

    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/login', '/signup', '/naver*'], // Include naver verification files
            disallow: ['/dashboard/', '/onboarding/', '/api/', '/auth/'], // Protect private routes
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
