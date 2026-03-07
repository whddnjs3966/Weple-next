import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-pink-400 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">로딩 중...</p>
        </div>
    )
}
