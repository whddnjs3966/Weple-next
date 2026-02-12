import { getVendorCategories, getVendors } from '@/actions/vendors'
import VendorSearchForm from '@/components/vendors/SearchForm'
import VendorCard from '@/components/vendors/VendorCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function VendorsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined
    const region = typeof resolvedSearchParams.region === 'string' ? resolvedSearchParams.region : undefined

    const [categories, rawVendors] = await Promise.all([
        getVendorCategories(),
        getVendors({ category, region }),
    ])
    const vendors = rawVendors as unknown as any[]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-serif">업체 찾기</h1>
                    <p className="text-gray-500 text-sm mt-1">완벽한 결혼식을 위한 최고의 파트너를 만나보세요.</p>
                </div>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={16} />
                    대시보드로 돌아가기
                </Link>
            </div>

            {/* Search & Filter */}
            <VendorSearchForm categories={categories} />

            {/* Vendor Grid */}
            {vendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                        <VendorCard key={vendor.id} vendor={vendor} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                        🔍
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">조건에 맞는 업체가 없습니다</h3>
                    <p className="text-gray-500 text-sm">검색 조건을 변경하여 다시 시도해보세요.</p>
                </div>
            )}

        </div>
    )
}
