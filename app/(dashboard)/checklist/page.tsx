import ChecklistClient from "@/components/checklist/ChecklistClient";
import { getTasks } from "@/actions/checklist";
import { createClient } from "@/lib/supabase/server";

export default async function ChecklistPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const tasks = await getTasks();
    return <ChecklistClient initialTasks={tasks} currentUserId={user?.id || ''} />
}
