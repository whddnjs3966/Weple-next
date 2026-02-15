'use client'

import Link from "next/link"
import { useState } from "react"
import SettingsModal from "@/components/settings/SettingsModal"
import { Settings } from "lucide-react"

interface DashboardNavbarProps {
    user: any
    weddingDate: Date | null
    inviteCode?: string
}

export default function DashboardNavbar({ user, weddingDate, inviteCode }: DashboardNavbarProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
                <nav className="flex items-center justify-between p-1.5 bg-black/20 rounded-full backdrop-blur-md border border-white/10 shadow-lg mx-auto">

                    {/* Links */}
                    <div className="flex items-center gap-1">
                        <Link href="/schedule" className="px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition-all">Schedule</Link>
                        <Link href="/checklist" className="px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition-all">Checklist</Link>
                        <Link href="/vendors" className="px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition-all">Vendor</Link>
                        <Link href="/community" className="px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition-all">Community</Link>
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all ml-2"
                        title="Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </nav>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
                weddingDate={weddingDate}
                inviteCode={inviteCode}
            />
        </>
    )
}
