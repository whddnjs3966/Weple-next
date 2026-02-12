'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Category } from '@/actions/vendors'
import { Search } from 'lucide-react'

export default function VendorSearchForm({ categories }: { categories: Category[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [category, setCategory] = useState(searchParams.get('category') || '')
    const [region, setRegion] = useState(searchParams.get('region') || '')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(() => {
            const params = new URLSearchParams()
            if (category) params.set('category', category)
            if (region) params.set('region', region)
            router.push(`/vendors?${params.toString()}`)
        })
    }

    return (
        <div className="glass-card p-6 mb-8 border border-gray-100 shadow-sm">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Category</label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-11 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                        >
                            <option value="">전체 카테고리</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug!}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-5 md:col-start-6">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Region</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            placeholder="지역 검색 (예: 강남구)"
                            className="w-full h-11 pl-4 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-11 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        <Search size={16} />
                        {isPending ? 'Searching...' : '검색'}
                    </button>
                </div>

            </form>
        </div>
    )
}
