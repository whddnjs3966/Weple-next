'use client'

import { useEffect, useRef } from 'react'

interface ParticlesProps {
    className?: string
    quantity?: number
}

export default function Particles({ className = '', quantity = 160 }: ParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let w = (canvas.width = window.innerWidth)
        let h = (canvas.height = window.innerHeight)
        let animId: number
        let tick = 0

        // 별 색상: 자연스러운 별빛 색상
        const starColors = [
            { r: 255, g: 255, b: 255 },   // 순백
            { r: 210, g: 230, b: 255 },   // 차가운 청백
            { r: 255, g: 248, b: 220 },   // 따뜻한 황백
            { r: 255, g: 220, b: 245 },   // 연한 핑크-화이트 (웨딩 무드)
            { r: 180, g: 210, b: 255 },   // 연한 블루
        ]

        // 별 타입별 비율: tiny(60%) / normal(30%) / bright(10%)
        type StarType = 'tiny' | 'normal' | 'bright'

        interface Star {
            x: number
            y: number
            size: number
            speedY: number
            speedX: number
            baseOpacity: number
            twinklePhase: number
            twinkleSpeed: number
            twinkleAmp: number
            color: { r: number; g: number; b: number }
            type: StarType
        }

        const stars: Star[] = []

        for (let i = 0; i < quantity; i++) {
            const rand = i / quantity
            const type: StarType = rand < 0.60 ? 'tiny' : rand < 0.90 ? 'normal' : 'bright'

            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: type === 'tiny'
                    ? Math.random() * 0.7 + 0.2
                    : type === 'normal'
                        ? Math.random() * 1.2 + 0.7
                        : Math.random() * 2.0 + 1.2,
                speedY: type === 'tiny'
                    ? Math.random() * 0.12 + 0.04
                    : type === 'normal'
                        ? Math.random() * 0.22 + 0.08
                        : Math.random() * 0.35 + 0.12,
                speedX: (Math.random() - 0.5) * 0.08,
                baseOpacity: type === 'tiny'
                    ? Math.random() * 0.35 + 0.15
                    : type === 'normal'
                        ? Math.random() * 0.45 + 0.25
                        : Math.random() * 0.55 + 0.40,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: type === 'tiny'
                    ? Math.random() * 0.018 + 0.006
                    : Math.random() * 0.025 + 0.010,
                twinkleAmp: type === 'bright'
                    ? Math.random() * 0.4 + 0.3
                    : Math.random() * 0.25 + 0.15,
                color: starColors[Math.floor(Math.random() * starColors.length)],
                type,
            })
        }

        function drawStar(s: Star) {
            const twinkle = Math.sin(s.twinklePhase) * s.twinkleAmp
            const opacity = Math.max(0.05, Math.min(1, s.baseOpacity + twinkle))
            const { r, g, b } = s.color

            ctx!.save()

            if (s.type === 'tiny') {
                // ── 작은 별: 단순 원 ──
                ctx!.globalAlpha = opacity
                ctx!.beginPath()
                ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2)
                ctx!.fillStyle = `rgb(${r}, ${g}, ${b})`
                ctx!.fill()

            } else if (s.type === 'normal') {
                // ── 보통 별: 글로우 + 원 ──
                ctx!.shadowBlur = s.size * 5
                ctx!.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.7})`
                ctx!.globalAlpha = opacity
                ctx!.beginPath()
                ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2)
                ctx!.fillStyle = `rgb(${r}, ${g}, ${b})`
                ctx!.fill()

                // 밝은 중심
                ctx!.shadowBlur = 0
                ctx!.globalAlpha = opacity * 0.8
                ctx!.beginPath()
                ctx!.arc(s.x, s.y, s.size * 0.45, 0, Math.PI * 2)
                ctx!.fillStyle = `rgba(255, 255, 255, 0.9)`
                ctx!.fill()

            } else {
                // ── 밝은 별: 강한 글로우 + 십자 플레어 ──
                // 외부 글로우 (큰 헤일로)
                const gradient = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 8)
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.35})`)
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
                ctx!.globalAlpha = 1
                ctx!.fillStyle = gradient
                ctx!.beginPath()
                ctx!.arc(s.x, s.y, s.size * 8, 0, Math.PI * 2)
                ctx!.fill()

                // 코어 글로우
                ctx!.shadowBlur = s.size * 8
                ctx!.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`
                ctx!.globalAlpha = opacity
                ctx!.beginPath()
                ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2)
                ctx!.fillStyle = `rgb(${r}, ${g}, ${b})`
                ctx!.fill()

                // 순백 중심점
                ctx!.shadowBlur = s.size * 3
                ctx!.shadowColor = 'rgba(255,255,255,1)'
                ctx!.globalAlpha = opacity
                ctx!.beginPath()
                ctx!.arc(s.x, s.y, s.size * 0.4, 0, Math.PI * 2)
                ctx!.fillStyle = 'rgb(255, 255, 255)'
                ctx!.fill()

                // 십자 플레어 (별빛 방사)
                const flareLen = s.size * (5 + twinkle * 3)
                ctx!.shadowBlur = 4
                ctx!.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`
                ctx!.globalAlpha = opacity * 0.45
                ctx!.lineWidth = 0.6
                ctx!.strokeStyle = `rgba(255, 255, 255, 0.9)`
                ctx!.beginPath()
                // 수평
                ctx!.moveTo(s.x - flareLen, s.y)
                ctx!.lineTo(s.x + flareLen, s.y)
                // 수직
                ctx!.moveTo(s.x, s.y - flareLen)
                ctx!.lineTo(s.x, s.y + flareLen)
                // 대각 (45도, 더 짧게)
                const diagLen = flareLen * 0.55
                ctx!.moveTo(s.x - diagLen, s.y - diagLen)
                ctx!.lineTo(s.x + diagLen, s.y + diagLen)
                ctx!.moveTo(s.x + diagLen, s.y - diagLen)
                ctx!.lineTo(s.x - diagLen, s.y + diagLen)
                ctx!.stroke()
            }

            ctx!.restore()
        }

        function animate() {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, w, h)
            tick++

            stars.forEach(s => {
                // 낙하 이동
                s.y += s.speedY
                s.x += s.speedX
                // 반짝임 위상 진행
                s.twinklePhase += s.twinkleSpeed

                // 화면 아래로 벗어나면 위에서 재등장
                if (s.y > h + 10) {
                    s.y = -10
                    s.x = Math.random() * w
                }
                if (s.x < -10) s.x = w + 10
                if (s.x > w + 10) s.x = -10

                drawStar(s)
            })

            animId = requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
            w = canvas.width = window.innerWidth
            h = canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animId)
        }
    }, [quantity])

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
        />
    )
}
