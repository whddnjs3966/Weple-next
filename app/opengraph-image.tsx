import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'WEPLN - 설레는 결혼 준비, 나만의 웨딩플래너'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FCFAF6 0%, #FDF2F8 50%, #FFFBF0 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(249, 168, 212, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'rgba(212, 163, 115, 0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(167, 196, 160, 0.08)',
          }}
        />

        {/* Ring icon */}
        <div
          style={{
            fontSize: '72px',
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          💍
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 700,
            color: '#BE9B7B',
            letterSpacing: '-2px',
            marginBottom: '12px',
            display: 'flex',
          }}
        >
          Wepln
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#4B5563',
            marginBottom: '8px',
            display: 'flex',
          }}
        >
          설레는 결혼 준비, 나만의 웨딩플래너
        </div>

        {/* Sub description */}
        <div
          style={{
            fontSize: '20px',
            color: '#9CA3AF',
            display: 'flex',
          }}
        >
          일정 · 예산 · 체크리스트 · AI 업체추천 · 커플 공유
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '6px',
            background: 'linear-gradient(90deg, #F9A8D4, #D4A373, #A7C4A0)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
