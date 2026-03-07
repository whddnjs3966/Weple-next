'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Page Level Error Caught:', error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mb-6 bg-red-50 rounded-full flex items-center justify-center">
                <span className="text-3xl">💦</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">앗, 장소 데이터를 불러오는 데 문제가 발생했어요.</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                네이버 검색 API 호출 한도를 초과했거나 일시적인 네트워크 오류일 수 있습니다.<br />
                잠깐 기다렸다가 다시 시도해주세요!
            </p>
            <div className="flex gap-4">
                <Link
                    href="/dashboard"
                    className="px-6 py-2.5 rounded-xl border-2 border-pink-100 text-gray-500 font-bold hover:bg-pink-50 hover:text-pink-500 transition-all"
                >
                    대시보드로 가기
                </Link>
                <button
                    onClick={reset}
                    className="px-6 py-2.5 rounded-xl bg-pink-400 text-white font-bold hover:bg-pink-500 hover:shadow-lg hover:shadow-pink-400/30 transition-all"
                >
                    다시 시도하기
                </button>
            </div>
        </div>
    )
}
