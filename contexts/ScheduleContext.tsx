'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface ScheduleEvent {
    id: string
    title: string
    date: string // YYYY-MM-DD
    time?: string
    location?: string
    type: 'schedule' | 'memo' | 'checklist'
    memo?: string
    checklistId?: string // link back to checklist item
}

interface ScheduleContextType {
    events: ScheduleEvent[]
    addEvent: (event: Omit<ScheduleEvent, 'id'>) => void
    removeEvent: (id: string) => void
    getEventsForDate: (dateStr: string) => ScheduleEvent[]
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined)

export function ScheduleProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<ScheduleEvent[]>([])

    const addEvent = (event: Omit<ScheduleEvent, 'id'>) => {
        const newEvent: ScheduleEvent = {
            ...event,
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        }
        setEvents(prev => [...prev, newEvent])
    }

    const removeEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id))
    }

    const getEventsForDate = (dateStr: string) => {
        return events.filter(e => e.date === dateStr)
    }

    return (
        <ScheduleContext.Provider value={{ events, addEvent, removeEvent, getEventsForDate }}>
            {children}
        </ScheduleContext.Provider>
    )
}

export function useSchedule() {
    const ctx = useContext(ScheduleContext)
    if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider')
    return ctx
}
