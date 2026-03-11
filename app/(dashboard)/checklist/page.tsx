import { Metadata } from "next";
import ChecklistClient from "@/components/checklist/ChecklistClient";
import { getTasks } from "@/actions/checklist";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: '체크리스트 - 결혼 준비 할일 관리',
    description: '결혼 준비에 필요한 모든 항목을 체크리스트로 관리하세요. D-Day 기반 일정과 예산을 함께 확인합니다.',
}

export default async function ChecklistPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const tasks = await getTasks();
    return <ChecklistClient initialTasks={tasks} currentUserId={user?.id || ''} />
}
