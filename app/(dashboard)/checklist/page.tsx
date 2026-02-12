import { getTasks } from '@/actions/checklist'
import ChecklistClient from '@/components/checklist/ChecklistClient'

export default async function ChecklistPage() {
    const tasks = await getTasks()

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">

            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif italic">Checklist</h2>
                <div className="w-8 h-0.5 bg-gray-800 mx-auto mt-4 mb-2"></div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">Don't miss a thing</p>
            </div>

            <ChecklistClient initialTasks={tasks} />

        </div>
    )
}
