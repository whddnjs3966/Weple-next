import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ──────────────────────────────────────────────────────────────
// 카테고리별 검색 키워드
// 네이버 Local API는 display=5(최대), total도 5건이 한계이므로
// 페이징 대신 **키워드 다양화**로 결과 풀을 극대화한다.
// 키워드마다 완전히 다른 업체가 나오므로 변형이 많을수록 좋다.
// ──────────────────────────────────────────────────────────────
const CATEGORY_QUERIES: Record<string, string[]> = {
    'wedding-hall': [
        '웨딩홀', '예식장', '결혼식장', '웨딩컨벤션',
        '호텔웨딩', '하우스웨딩', '스몰웨딩', '소규모웨딩',
        '호텔 예식', '웨딩 연회', '그랜드볼룸', '웨딩뷔페',
    ],
    'studio': [
        '웨딩스튜디오', '웨딩촬영', '웨딩사진', '결혼사진',
        '브라이덜사진', '사진스튜디오', '촬영스튜디오', '브라이덜스튜디오',
    ],
    'dress': [
        '웨딩드레스', '브라이덜샵', '드레스샵', '웨딩드레스대여',
        '드레스투어', '브라이덜', '결혼드레스',
    ],
    'makeup': [
        '웨딩메이크업', '브라이덜메이크업', '신부메이크업',
        '헤어메이크업', '메이크업샵', '웨딩헤어',
    ],
    'snap': [
        '본식스냅', '웨딩스냅', '결혼식스냅', '결혼스냅',
        '스냅촬영', '본식DVD', '본식촬영', '웨딩영상', '본식영상',
    ],
    'jewelry': [
        '예물', '웨딩밴드', '결혼반지', '웨딩링',
        '예물샵', '웨딩주얼리', '결혼예물',
    ],
    'suit': [
        '남성정장', '웨딩정장', '턱시도대여', '신랑정장',
        '맞춤정장', '예복', '맞춤예복', '테일러샵',
    ],
    'hanbok': [
        '한복대여', '혼주한복', '웨딩한복', '한복맞춤',
        '신부한복', '전통한복', '한복샵', '퓨전한복',
    ],
    'invitation': [
        '청첩장', '모바일청첩장', '웨딩카드', '결혼청첩장',
        '청첩장인쇄', '프리미엄청첩장', '웨딩초대장',
    ],
    'pyebaek': [
        '폐백음식', '이바지', '폐백', '폐백음식점',
        '이바지떡', '전통폐백', '폐백서비스',
    ],
    'bouquet': [
        '웨딩부케', '본식부케', '부케', '웨딩플라워',
        '꽃집 부케', '웨딩꽃', '플로리스트 웨딩',
    ],
}

// ──────────────────────────────────────────────────────────────
// "서울" 등 광역시/도 단위에서는 네이버 API가 0건을 반환하는 경우가 많으므로
// 대표 하위 지역을 추가 검색하여 결과를 보강한다.
// ──────────────────────────────────────────────────────────────
const SIDO_SUB_REGIONS: Record<string, string[]> = {
    '서울': ['강남', '잠실', '종로', '서초', '마포', '여의도', '청담', '압구정', '송파'],
    '경기': ['수원', '분당', '일산', '판교', '용인', '성남', '고양', '화성', '안양'],
    '인천': ['송도', '부평', '인천시', '남동구', '연수구'],
    '부산': ['해운대', '서면', '센텀시티', '남포동', '부산진구', '동래', '사상'],
    '대구': ['수성구', '동성로', '범어', '달서구', '북구', '중구', '동구', '대구시', '두류', '상인'],
    '대전': ['유성구', '둔산동', '서구', '중구'],
    '광주': ['상무지구', '충장로', '서구', '북구'],
    '울산': ['남구', '삼산동', '중구', '북구'],
    '세종': ['세종시', '조치원'],
    '경남': ['창원', '김해', '진주', '양산', '거제'],
    '경북': ['포항', '경주', '구미', '안동'],
    '충남': ['천안', '아산', '서산'],
    '충북': ['청주', '충주'],
    '전남': ['여수', '순천', '목포', '광양'],
    '전북': ['전주', '군산', '익산'],
    '강원': ['춘천', '강릉', '원주', '속초'],
    '제주': ['제주시', '서귀포'],
}

// 제외 키워드 (불필요한 셀프사진관, 학원 등 제거, '공방' 제외 해제)
const GLOBAL_EXCLUDED = ['셀프', '클래스', '원데이', '수강', '레슨', '체험', '취미', 'DIY', '만들기', '교실', '학원', '강좌', '아카데미']
const CATEGORY_EXCLUDED: Record<string, string[]> = {
    'jewelry': ['반지공방', '커플링체험', '실버', '은반지', '체험공방', '우드링', '악세사리', '도매', '부자재'],
    'studio': ['셀프사진관', '포토부스', '증명사진', '여권사진', '인생네컷', '키즈', '가족사진', '베이비', '우정사진', '프로필'],
    'dress': ['한복대여', '코스프레', '파티의상', '파티룸', '셀프스튜디오', '의상대여', '아동복', '교복'],
    'makeup': ['네일', '왁싱', '반영구', '피부과', '에스테틱', '올리브영', '롯데마트', '미용학원', '눈썹'],
    'suit': ['세탁', '수선', '클리닝', '아웃도어', '교복', '작업복'],
    'bouquet': ['화환', '조화', '조경', '인테리어', '화분', '근조', '관엽', '개업'],
    'snap': ['셀프사진관', '포토부스', '증명사진', '가족사진', '돌스냅', '베이비스냅'],
    'wedding-hall': ['장례', '연습실', '세미나', '장례식장', '포차', '한식', '일식', '중식', '고기집', '국밥', '식당'],
    'hanbok': ['세탁', '수선', '한복체험', '관광', '전통체험', '외국인', '대패'],
    'invitation': ['인쇄소', '복사', '명함', '전단지', '간판', '현수막', '스티커', '판촉물'],
    'pyebaek': ['장례', '제사', '차례', '제사음식', '반찬', '식육'],
}

// 카테고리 관련성 필터 — 네이버 API category 필드 + 장소명 + 설명에서 확인
// 빈 배열이면 필터링하지 않음
const CATEGORY_RELEVANCE: Record<string, string[]> = {
    'wedding-hall': ['웨딩', '예식', '컨벤션', '호텔', '연회', '홀', '채플', '결혼', '하우스', '가든', '뷔페', '볼룸', '리조트', '그랜드'],
    'studio': ['사진', '스튜디오', '촬영', '영상', '포토', '웨딩', '브라이덜', '브라이달'],
    'dress': ['웨딩', '드레스', '의류', '의상', '브라이덜', '브라이달', '샵'],
    'makeup': ['미용', '메이크업', '뷰티', '헤어', '웨딩', '살롱', '브라이덜'],
    'snap': ['사진', '스냅', '촬영', '웨딩', '결혼', '영상', '스튜디오', 'dvd'],
    'jewelry': ['보석', '귀금속', '주얼리', '쥬얼리', '반지', '예물', '다이아'],
    'suit': ['테일러', '맞춤', '정장', '의류', '양복', '예복', '턱시도', '가먼트', '수트'],
    'hanbok': ['한복', '전통', '혼주', '폐백', '맞춤', '대여', '의류', '의상', '한복집'],
    'invitation': ['청첩장', '카드', '인쇄', '초대장', '웨딩', '디자인', '모바일'],
    'pyebaek': ['폐백', '이바지', '떡', '한과', '전통', '음식', '케이터링', '답례'],
    'bouquet': ['꽃', '화원', '플라워', '부케', '식물', '플로리스트', '가든'],
}

function stripHtml(str: string): string {
    return str
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}

interface NaverLocalItem {
    title: string
    address: string
    roadAddress: string
    telephone: string
    link: string
    category: string
    description: string
    mapx: string
    mapy: string
}

async function fetchLocal(
    query: string,
    clientId: string,
    clientSecret: string,
    start: number = 1,
): Promise<NaverLocalItem[]> {
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=${start}&sort=comment`
    const res = await fetch(url, {
        headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
        },
        cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
}

// Fisher-Yates 셔플
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export async function GET(request: NextRequest) {
    // 인증 확인
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'wedding-hall'
    const sidoParam = searchParams.get('sido') || '서울'
    const sidos = sidoParam.split(',').map(s => s.trim()).filter(Boolean)
    const sigungu = searchParams.get('sigungu') || ''

    const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    const clientSecret = process.env.NAVER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.' },
            { status: 500 }
        )
    }

    const rawFilters = searchParams.get('filters') || ''
    // 1. 괄호 내용 제거 -> 2. 슬래시 앞단어만 -> 3. 인원명수/돈 단위 제거 -> 네이버 검색 최적화
    const filterKeywords = rawFilters.split(',')
        .map(f => f.trim())
        .map(f => f.replace(/\([^)]*\)/g, '').trim()) // 괄호와 그 안 내용물 싹 삭제 "인물 중심 (심플/클래식)" -> "인물 중심"
        .map(f => f.split('/')[0].trim()) // 슬래시로 2개 이상 선택지가 있다면 1개로 압축 "화이트 & 그린" -> "화이트 & 그린" // "벨라인/A라인" -> "벨라인"
        .filter(f => f && !f.includes('명') && !f.includes('만원') && !f.includes('원'))
    const budget = Number(searchParams.get('budget') || '0')
    const style = searchParams.get('style') || ''

    const keywords = CATEGORY_QUERIES[category] || ['웨딩홀']
    const relevanceKeywords = CATEGORY_RELEVANCE[category] || []

    // 예산 기반 키워드 보강: 예산이 낮으면 가성비, 높으면 프리미엄 검색어 추가
    if (budget > 0) {
        if (budget <= 2000) {
            filterKeywords.push('가성비')
        } else if (budget >= 5000) {
            filterKeywords.push('프리미엄')
        }
    }

    // 온보딩 스타일 키워드 반영
    const STYLE_KEYWORDS: Record<string, string[]> = {
        'Classic': ['클래식', '격식'],
        'Garden': ['야외', '가든'],
        'Modern': ['모던', '미니멀'],
        'Small': ['소규모', '스몰웨딩'],
    }
    if (style) {
        const styles = style.split(',')
        for (const s of styles) {
            const mapped = STYLE_KEYWORDS[s.trim()]
            if (mapped) filterKeywords.push(mapped[0])
        }
    }

    // ──────────────────────────────────────────────────────────
    // 검색 쿼리 생성 전략 (우선순위 순서):
    // 1) 기본 쿼리: "{지역} {키워드}" — 가장 결과가 잘 나오는 핵심 쿼리를 최우선
    // 2) 하위 지역 보강: "{하위지역} {키워드}" — 광역시/도에서 결과 다양성 확보
    // 3) 필터 조합: "{지역} {필터} {키워드}" — 필터가 있을 때 추가 다양성
    // ──────────────────────────────────────────────────────────
    const queries: string[] = []
    const targetRegions = sigungu ? [sigungu] : sidos

    // Phase 1: 기본 쿼리 (최우선)
    for (const region of targetRegions) {
        for (const kw of keywords) {
            queries.push(`${region} ${kw}`)
        }
        // 역순 (네이버 API에서 다른 결과를 반환하는 경우가 많음)
        for (const kw of keywords.slice(0, Math.ceil(keywords.length / 2))) {
            queries.push(`${kw} ${region}`)
        }
    }

    // Phase 2: 하위 지역 보강
    for (const region of targetRegions) {
        const subRegions = SIDO_SUB_REGIONS[region]
        if (subRegions && !sigungu) {
            const coreKeywords = keywords.slice(0, 4)
            for (const sub of subRegions) {
                for (const kw of coreKeywords) {
                    queries.push(`${sub} ${kw}`)
                    queries.push(`${kw} ${sub}`)
                }
            }
        }
    }

    // Phase 3: 필터 조합 쿼리 (보너스 — 슬롯이 남을 때만 사용됨)
    // 필터 키워드를 네이버 검색에 유효한 짧은 핵심어로 가공
    const shortFilterKws = filterKeywords
        .flatMap(fk => fk.split(/[\s·,]+/))
        .filter(w => w.length >= 2 && w.length <= 5)
        .slice(0, 3)

    if (shortFilterKws.length > 0) {
        for (const region of targetRegions) {
            const coreKeywords = keywords.slice(0, 4)
            for (const kw of coreKeywords) {
                for (const fk of shortFilterKws) {
                    queries.push(`${region} ${fk} ${kw}`)
                }
            }
        }
    }

    // API Rate Limit 방지 및 응답 속도 최적화를 위해 중복 제거 후 최대 40개로 쿼리 제한
    const uniqueQueries = Array.from(new Set(queries)).slice(0, 40)

    // 병렬 요청: 핵심 키워드(처음 5개)는 start=1,6으로 2페이지씩, 나머지는 1페이지
    console.log(`[Naver Search] Category: ${category}, Queries: ${uniqueQueries.length}`)
    const coreCount = Math.min(5, uniqueQueries.length)
    const fetchPromises = [
        ...uniqueQueries.slice(0, coreCount).flatMap(q => [
            fetchLocal(q, clientId, clientSecret, 1),
            fetchLocal(q, clientId, clientSecret, 6),
        ]),
        ...uniqueQueries.slice(coreCount).map(q => fetchLocal(q, clientId, clientSecret)),
    ]
    const resultsSettings = await Promise.allSettled(fetchPromises)

    // 성공한 응답(fulfilled)의 데이터만 플랫하게 병합
    const allItems = resultsSettings
        .filter((res): res is PromiseFulfilledResult<NaverLocalItem[]> => res.status === 'fulfilled')
        .flatMap(res => res.value)

    // 중복 제거 (장소명 기준)
    const seen = new Set<string>()
    const unique = allItems.filter(item => {
        const t = stripHtml(item.title)
        if (seen.has(t)) return false
        seen.add(t)
        return true
    })

    // 제외 키워드 필터링
    const extraExcluded = CATEGORY_EXCLUDED[category] || []
    const allExcluded = [...GLOBAL_EXCLUDED, ...extraExcluded]
    const afterExclusion = unique.filter(item => {
        const title = stripHtml(item.title).toLowerCase()
        const cat = item.category.toLowerCase()
        return !allExcluded.some(kw => title.includes(kw.toLowerCase()) || cat.includes(kw.toLowerCase()))
    })

    // 카테고리 관련성 필터링 (느슨한 모드):
    // category 필드 + 장소명 + 설명 중 하나라도 매칭되면 통과
    let filtered = afterExclusion
    if (relevanceKeywords.length > 0) {
        const strictFiltered = afterExclusion.filter(item => {
            const cat = item.category.toLowerCase()
            const title = stripHtml(item.title).toLowerCase()
            const desc = item.description.toLowerCase()
            return relevanceKeywords.some(kw =>
                cat.includes(kw) || title.includes(kw) || desc.includes(kw)
            )
        })
        // 관련성 필터 후 결과가 너무 적으면 제외 필터만 적용된 결과로 폴백
        filtered = strictFiltered.length >= 3 ? strictFiltered : afterExclusion
    }

    // 지역 하드 필터: 주소에 검색한 시도/시군구가 포함된 결과만 남김
    const regionFiltered = filtered.filter(item => {
        const matchesSido = sidos.some(s => item.address.includes(s) || item.roadAddress.includes(s))
        const matchesSigungu = sigungu ? (item.address.includes(sigungu) || item.roadAddress.includes(sigungu)) : false
        return matchesSido || matchesSigungu
    })

    // 관련성 점수 계산 후 정렬 (높은 점수 우선, 동일 점수는 셔플)
    const scored = regionFiltered.map(item => {
        const title = stripHtml(item.title).toLowerCase()
        const cat = item.category.toLowerCase()
        const desc = item.description.toLowerCase()
        let score = 0
        // 카테고리 관련 키워드 매칭 수에 따라 가산
        for (const kw of relevanceKeywords) {
            if (title.includes(kw)) score += 3
            if (cat.includes(kw)) score += 2
            if (desc.includes(kw)) score += 1
        }
        // 필터 키워드 매칭 보너스
        for (const fk of filterKeywords) {
            const fkLower = fk.toLowerCase()
            if (title.includes(fkLower) || desc.includes(fkLower)) score += 2
        }
        // 지역 매칭 보너스
        score += 2

        // 온보딩 데이터 기반 AI 매칭 보너스 (압도적 가중치 +5)
        if (budget > 0) {
            // 예산이 낮으면 가성비/합리적 업체 우대
            if (budget <= 2000 && (title.includes('가성비') || desc.includes('가성비') || desc.includes('합리적') || desc.includes('셀프'))) {
                score += 5
            }
            // 예산이 높으면 프리미엄/하이엔드 업체 우대
            else if (budget >= 5000 && (title.includes('하이엔드') || desc.includes('하이엔드') || title.includes('프리미엄') || desc.includes('프리미엄') || title.includes('고급') || desc.includes('고급') || title.includes('럭셔리') || desc.includes('럭셔리'))) {
                score += 5
            }
        }

        // 온보딩 스타일 반영 가중치
        if (style) {
            const styles = style.split(',')
            for (const s of styles) {
                const mapped = STYLE_KEYWORDS[s.trim()]
                if (mapped) {
                    for (const m of mapped) {
                        if (title.includes(m) || desc.includes(m) || cat.includes(m)) {
                            score += 5
                        }
                    }
                }
            }
        }

        return { item, score }
    })
    scored.sort((a, b) => b.score - a.score)
    // 동일 점수 그룹 내에서 셔플하여 다양성 유지
    const grouped: typeof scored = []
    let i = 0
    while (i < scored.length) {
        let j = i
        while (j < scored.length && scored[j].score === scored[i].score) j++
        const group = scored.slice(i, j)
        grouped.push(...shuffle(group))
        i = j
    }

    const places = grouped.map(({ item }) => ({
        title: stripHtml(item.title),
        address: item.address,
        roadAddress: item.roadAddress,
        telephone: item.telephone,
        link: item.link,
        category: item.category,
        description: item.description,
        mapx: item.mapx,
        mapy: item.mapy,
    }))

    const primaryQuery = `${targetRegions.join(', ')} ${keywords[0]}`
    return NextResponse.json({ places, query: primaryQuery })
}
