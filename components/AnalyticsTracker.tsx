"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const startTimeRef = useRef<number>(Date.now());
    const pathRef = useRef<string>(pathname);
    const sessionIdRef = useRef<string>("");
    const userIdRef = useRef<string | null>(null);
    const supabaseRef = useRef(createClient());

    useEffect(() => {
        // Generate session ID if not exists
        if (!sessionStorage.getItem('analytics_session_id')) {
            sessionStorage.setItem('analytics_session_id', uuidv4());
        }
        sessionIdRef.current = sessionStorage.getItem('analytics_session_id') || uuidv4();

        // 유저 ID를 한 번만 조회하여 캐싱
        supabaseRef.current.auth.getUser().then(({ data: { user } }) => {
            userIdRef.current = user?.id || null;
        });
    }, []);

    useEffect(() => {
        // 경로가 변경되었을 때의 처리 (이전 경로의 체류 시간 전송)
        if (pathRef.current !== pathname) {
            const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
            const prevPath = pathRef.current;

            if (durationSeconds > 0) {
                sendLog(prevPath, durationSeconds);
            }

            // 새 경로 정보 업데이트
            pathRef.current = pathname;
            startTimeRef.current = Date.now();
        }
    }, [pathname]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
            if (durationSeconds > 0) {
                sendLog(pathRef.current, durationSeconds);
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    const getTabName = (path: string) => {
        if (path === '/') return 'Home';
        if (path.startsWith('/schedule')) return 'Schedule';
        if (path.startsWith('/checklist')) return 'Checklist';
        if (path.startsWith('/vendors')) return 'Vendors';
        if (path.startsWith('/places')) return 'Places';
        if (path.startsWith('/community')) return 'Community';
        if (path.startsWith('/admin')) return 'Admin';
        if (path.startsWith('/dashboard')) return 'Dashboard';
        if (path.startsWith('/profile')) return 'Profile';
        return 'Other';
    };

    const sendLog = async (path: string, durationSeconds: number) => {
        try {
            await supabaseRef.current.from("analytics_events" as any).insert({
                user_id: userIdRef.current,
                session_id: sessionIdRef.current,
                event_type: "page_view",
                path: path,
                tab_name: getTabName(path),
                duration_seconds: durationSeconds,
            });
        } catch (e) {
            console.error("Failed to send analytics log", e);
        }
    };

    return null;
}
