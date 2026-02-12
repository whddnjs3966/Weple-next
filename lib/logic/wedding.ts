import { differenceInDays, parseISO, startOfDay } from 'date-fns'

export function calculateDDay(weddingDateStr: string | null): number | null {
    if (!weddingDateStr) return null

    const today = startOfDay(new Date())
    const weddingDate = startOfDay(parseISO(weddingDateStr))

    // differenceInDays(left, right) => left - right.
    // We want D-Day: Wedding - Today = Days Remaining.
    // Django logic: usually D-30 means 30 days left.
    // If today is 2026-01-01 and wedding is 2026-02-01, diff is 31.

    return differenceInDays(weddingDate, today)
}

export interface DDayAction {
    title: string
    desc: string
    icon: string // bootstrap icon class mapped to lucide later
}

export function getDDayActions(dDay: number): DDayAction[] {
    if (dDay > 180) {
        return [
            { title: "예식장 예약", desc: "원하는 날짜와 시간대를 선점하세요.", icon: "bi-building" },
            { title: "웨딩 플래너 상담", desc: "전반적인 결혼 준비 계획을 세우세요.", icon: "bi-journal-bookmark" },
            { title: "상견례", desc: "양가 부모님과 정식으로 인사를 나누세요.", icon: "bi-people" },
        ]
    } else if (dDay > 90) {
        return [
            { title: "스드메 예약", desc: "스튜디오, 드레스, 메이크업 업체를 선정하세요.", icon: "bi-camera" },
            { title: "신혼여행 예약", desc: "항공권과 숙소를 미리 예약하세요.", icon: "bi-airplane" },
            { title: "예물/예단 준비", desc: "예산에 맞춰 예물과 예단을 준비하세요.", icon: "bi-gem" },
        ]
    } else if (dDay > 30) {
        return [
            { title: "청첩장 제작", desc: "하객 리스트를 정리하고 청첩장을 만드세요.", icon: "bi-envelope" },
            { title: "주례/사회자 섭외", desc: "결혼식을 도와줄 분들을 섭외하세요.", icon: "bi-mic" },
            { title: "웨딩 촬영", desc: "리허설 촬영을 진행하세요.", icon: "bi-camera-reels" },
        ]
    } else {
        return [
            { title: "본식 드레스 가봉", desc: "최종적으로 드레스를 점검하세요.", icon: "bi-stars" },
            { title: "식전 영상 제작", desc: "결혼식에서 상영할 영상을 준비하세요.", icon: "bi-play-circle" },
            { title: "최종 점검", desc: "예식 당일 필요한 물품을 체크하세요.", icon: "bi-check2-all" },
        ]
    }
}

export interface TimelineEvent {
    title: string
    date: string
    dDay: number
    type: 'task' | 'memo' | 'wedding'
}
