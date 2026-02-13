'use client'

import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react'

// Hardcoded Market Data (Korea 2025 Est)
// Unit: KRW
const MARKET_RATES: Record<string, { avg: number; label: string }> = {
    'venue': { avg: 15000000, label: '웨딩홀 평균' }, // 15M (Rental + Flower)
    'sdm': { avg: 3000000, label: '스드메 평균' },   // 3M
    'honeymoon': { avg: 5000000, label: '신혼여행 평균' }, // 5M
    'photographer': { avg: 1500000, label: '본식 스냅 평균' },
    'suit': { avg: 1000000, label: '예복 평균' }
}

interface Props {
    category?: string | null
    amount: number
    title: string
}

export default function SmartBudgetValidator({ category, amount, title }: Props) {
    if (!amount || amount === 0) return null

    // Heuristic: Try to guess category from title if not provided
    let detectedCategory = category
    if (!detectedCategory) {
        if (title.includes('홀') || title.includes('예식장')) detectedCategory = 'venue'
        else if (title.includes('스드메') || title.includes('촬영') || title.includes('드레스')) detectedCategory = 'sdm'
        else if (title.includes('여행') || title.includes('항공')) detectedCategory = 'honeymoon'
        else if (title.includes('스냅') || title.includes('사진')) detectedCategory = 'photographer'
        else if (title.includes('예복') || title.includes('정장')) detectedCategory = 'suit'
    }

    const marketData = detectedCategory ? MARKET_RATES[detectedCategory] : null

    if (!marketData) return null

    const diff = amount - marketData.avg
    const percent = (diff / marketData.avg) * 100

    // Thresholds
    // Good: < Avg + 10%
    // Warning: > Avg + 20%
    // Danger: > Avg + 50%

    if (percent > 50) {
        return (
            <div className="group relative inline-flex items-center ml-2">
                <AlertTriangle size={14} className="text-red-500 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-red-50 border border-red-100 text-red-600 text-xs p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <p className="font-bold mb-1">⚠️ 예산 초과 경고</p>
                    평균({marketData.label})보다 <span className="font-bold">{Math.round(percent)}%</span> 비쌉니다. (약 {Math.round(diff / 10000)}만원 차이)
                </div>
            </div>
        )
    }

    if (percent > 20) {
        return (
            <div className="group relative inline-flex items-center ml-2">
                <TrendingUp size={14} className="text-orange-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-orange-50 border border-orange-100 text-orange-600 text-xs p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <p className="font-bold mb-1">⚡ 높은 견적</p>
                    평균보다 조금 높아요. ({Math.round(percent)}% up)
                </div>
            </div>
        )
    }

    if (percent < -20) {
        return (
            <div className="group relative inline-flex items-center ml-2">
                <TrendingDown size={14} className="text-emerald-500 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <p className="font-bold mb-1">✨ 훌륭한 견적</p>
                    평균보다 <span className="font-bold">{Math.abs(Math.round(percent))}%</span> 저렴해요!
                </div>
            </div>
        )
    }

    return (
        <div className="group relative inline-flex items-center ml-2">
            <CheckCircle2 size={14} className="text-gray-300 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-50 border border-gray-100 text-gray-500 text-xs p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                평균적인 견적입니다.
            </div>
        </div>
    )
}
