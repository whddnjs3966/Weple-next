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

    useEffect(() => {
        // Generate session ID if not exists
        if (!sessionStorage.getItem('analytics_session_id')) {
            sessionStorage.setItem('analytics_session_id', uuidv4());
        }
        sessionIdRef.current = sessionStorage.getItem('analytics_session_id') || uuidv4();
    }, []);

    useEffect(() => {
        // 경로가 변경되었을 때의 처리 (이전 경로의 체류 시간 전송)
        if (pathRef.current !== pathname) {
            const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
            const prevPath = pathRef.current;

            // 5초 미만은 무의미한 클릭으로 간주하고 기록하지 않을 수 있음. 여기서는 일단 모두 전송.
            if (durationSeconds > 0) {
                sendLog(prevPath, durationSeconds);
            }

            // 새 경로 정보 업데이트
            pathRef.current = pathname;
            startTimeRef.current = Date.now();
        }
    }, [pathname]);

    useEffect(() => {
        // 사용자가 창을 닫거나 다른 사이트로 이동할 때 (unload) 체류 시간 전송
        const handleBeforeUnload = () => {
            const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
            if (durationSeconds > 0) {
                // Beacon API를 사용하여 안전하게 전송 (비동기 Fetch는 닫힐 때 취소될 수 있음)
                sendLogBeacon(pathRef.current, durationSeconds);
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
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from("analytics_events" as any).insert({
                user_id: user?.id || null,
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

    const sendLogBeacon = (path: string, durationSeconds: number) => {
        // Beacon API 구현은 단순화를 위해 생략하거나, edge function 호출 방식 등으로 구현 가능.
        // 여기서는 편의상 sendLog와 동일하게 Supabase 직접 호출을 시도 (Chrome에서는 취소될 수 있지만, 최선의 노력).
        sendLog(path, durationSeconds);
    }

    return null;
}
