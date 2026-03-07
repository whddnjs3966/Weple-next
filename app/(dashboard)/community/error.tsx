'use client'

import { useEffect } from 'react'

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
            <h2 className="text-2xl font-bold text-gray-800 mb-3">앗, 페이지를 불러오는 데 문제가 발생했습니다.</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                일시적인 네트워크 오류이거나 시스템 문제일 수 있습니다.<br />
                새로고침을 눌러 다시 시도해주세요.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2.5 rounded-xl border-2 border-pink-100 text-gray-500 font-bold hover:bg-pink-50 hover:text-pink-500 transition-all"
                >
                    이전으로
                </button>
                <button
                    onClick={reset}
                    className="px-6 py-2.5 rounded-xl bg-pink-400 text-white font-bold hover:bg-pink-500 hover:shadow-lg hover:shadow-pink-400/30 transition-all"
                >
                    새로고침
                </button>
            </div>
        </div>
    )
}
