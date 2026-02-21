import ChecklistClient from "@/components/checklist/ChecklistClient";
import { getTasks } from "@/actions/checklist";

export default async function ChecklistPage() {
    const tasks = await getTasks();
    return <ChecklistClient initialTasks={tasks} />
}
