import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'WEPLN - 나만의 웨딩플래너',
        short_name: 'WEPLN',
        description: '설레는 결혼 준비, 나만의 모바일 웨딩플래너. 일정, 예산, 체크리스트를 커플이 함께 관리합니다.',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#FCFAF6',
        theme_color: '#BE9B7B',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
