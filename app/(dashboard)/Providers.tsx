'use client'

import { ScheduleProvider } from '@/contexts/ScheduleContext'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ScheduleProvider>
            {children}
        </ScheduleProvider>
    )
}
