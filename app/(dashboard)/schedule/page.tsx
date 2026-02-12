import { getTasks } from '@/actions/checklist'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculateDDay, getDDayActions, TimelineEvent } from '@/lib/logic/wedding'
import ScheduleClient from '@/components/schedule/ScheduleClient'

export default async function SchedulePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile for wedding date
    const { data: profile } = await (supabase
        .from('profiles') as any) // Assuming 'profiles' table exists and linked
        .select('wedding_date')
        .eq('id', user.id)
        .single()

    const weddingDate = profile?.wedding_date || null // Start with null
    const dDay = calculateDDay(weddingDate)

    // Tasks
    const tasks = (await getTasks()) as unknown as any[] // Force cast to any[] first then let it match or just any

    // Prepare data for UI
    const dDayActions = dDay !== null ? getDDayActions(dDay) : []

    // Timeline Events: Filter tasks that have dates and D-Days
    const timelineEvents: TimelineEvent[] = tasks
        .filter(t => t.due_date) // Only scheduled tasks
        .map(t => ({
            title: t.title,
            date: t.due_date!, // confirmed by filter
            // dDay for current task relative to wedding? 
            // Or dDay FROM TODAY if we want to show them on the graph relative to now?
            // The graph displays "Today" to "Wedding".
            // A task due on 2026-02-15 (and Wedding is 2026-06-01)
            // Its "D-Day" (remaining days) is calculable.
            dDay: calculateDDay(t.due_date!) || 0, // Using same helper to get diff from Today
            type: 'task'
        }))

    return (
        <ScheduleClient
            initialTasks={tasks}
            weddingDate={weddingDate}
            dDay={dDay}
            dDayActions={dDayActions}
            timelineEvents={timelineEvents}
        />
    )
}
