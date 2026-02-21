import ScheduleClient from "@/components/schedule/ScheduleClient";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/actions/checklist";

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
