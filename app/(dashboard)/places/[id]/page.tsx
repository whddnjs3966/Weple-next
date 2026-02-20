import { getPlaceById } from '@/actions/places'
import { ArrowLeft, MapPin, Star, Phone, Globe, Clock, ThumbsUp, ThumbsDown } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PlaceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const place = await getPlaceById(Number(id))

    if (!place) {
        notFound()
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Navigation */}
            <Link
                href="/places"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors font-medium text-sm"
            >
                <ArrowLeft size={16} />
                목록으로 돌아가기
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Image & Basic Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Hero Image */}
                    <div className="aspect-video w-full rounded-3xl overflow-hidden bg-gray-100 shadow-lg relative group">
                        {place.image_url ? (
                            <img
                                src={place.image_url}
                                alt={place.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                <span className="text-sm">이미지 준비중</span>
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-primary font-bold shadow-sm">
                                {place.category?.name}
                            </span>
                        </div>
                    </div>

                    {/* Title & Rating */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h1 className="text-3xl font-bold text-gray-900 font-serif leading-tight">{place.name}</h1>
                            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100">
                                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                                <span className="font-bold text-gray-900 text-lg">{place.rating?.toFixed(1) || '0.0'}</span>
                                <span className="text-gray-400 text-sm">({(place as Record<string, unknown>).review_count as number || 0} reviews)</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-gray-500 mb-6">
                            <MapPin size={18} className="mt-0.5 text-primary shrink-0" />
                            <span className="leading-relaxed">{(place as Record<string, unknown>).address as string || `${place.region_sido} ${place.region_sigungu}`}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button disabled className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                                <Phone size={18} />
                                전화 문의 (준비중)
                            </button>
                            <button disabled className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                                <Globe size={18} />
                                웹사이트 방문 (준비중)
                            </button>
                        </div>
                    </div>

                    {/* Reviews Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <ThumbsUp size={18} />
                                장점 요약
                            </h3>
                            <p className="text-sm text-blue-800/80 leading-relaxed">
                                {(place as Record<string, unknown>).summary_positive as string || "등록된 장점 리뷰가 아직 없습니다."}
                            </p>
                        </div>
                        <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100">
                            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                <ThumbsDown size={18} />
                                단점 요약
                            </h3>
                            <p className="text-sm text-red-800/80 leading-relaxed">
                                {(place as Record<string, unknown>).summary_negative as string || "등록된 단점 리뷰가 아직 없습니다."}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Right Column: Sticky Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">

                        {/* Map Placeholder */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">위치 안내</h3>
                            <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
                                <MapPin size={32} />
                            </div>
                            <a
                                href={`https://map.naver.com/v5/search/${place.name}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full py-2.5 rounded-xl bg-[#03C75A] text-white font-bold text-sm text-center hover:bg-[#02b351] transition-all shadow-md shadow-green-500/20"
                            >
                                네이버 지도 보기
                            </a>
                        </div>

                        {/* Selection Actions (Future Implementation) */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-2">나의 웨딩 리스트</h3>
                            <p className="text-xs text-text-secondary mb-4">이 장소를 후보로 등록하거나 최종 선택할 수 있습니다.</p>

                            <div className="space-y-3">
                                <button disabled className="w-full py-2.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-all opacity-50 cursor-not-allowed">
                                    ❤️ 후보 등록하기
                                </button>
                                <button disabled className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all opacity-50 cursor-not-allowed">
                                    ✔️ 최종 선택하기
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
