import { Metadata } from "next";
import ScheduleClient from "@/components/schedule/ScheduleClient";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/actions/checklist";

export const metadata: Metadata = {
    title: '일정 관리 - 웨딩 스케줄',
    description: '결혼 준비 일정을 캘린더로 관리하세요. D-Day 기반 자동 일정 배치와 중요 이벤트를 한눈에 확인합니다.',
}

export default async function SchedulePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let weddingDate = null
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('wedding_date').eq('id', user.id).single()
        weddingDate = profile?.wedding_date
    }

    const tasks = await getTasks();

    return <ScheduleClient weddingDate={weddingDate} checklistTasks={tasks} />
}
