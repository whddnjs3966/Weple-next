"use client";

import { useEffect, useState } from "react";

export default function InAppBrowserBlocker() {
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const checkUserAgent = () => {
            const userAgent = navigator.userAgent.toLowerCase();

            // 인앱 브라우저 패턴 감지 (카카오, 네이버, 인스타그램, 스레드, 라인 등)
            const inAppPatterns = [
                "kakaotalk",
                "naver",
                "instagram",
                "threads",
                "daum",
                "line",
                "fb_iab", // Facebook In-App Browser
                "fb4a", // Facebook for Android
                "fban", // Facebook for Android
                "fbios", // Facebook for iOS
                "twitter",
                "snapchat",
            ];

            const isInternal = inAppPatterns.some((pattern) => userAgent.includes(pattern));
            const platformIsIOS = /iphone|ipad|ipod/i.test(userAgent);

            if (isInternal) {
                setIsInAppBrowser(true);
                setIsIOS(platformIsIOS);

                // 안드로이드의 경우 Chrome으로 리다이렉트 시도
                if (!platformIsIOS) {
                    const targetUrl = window.location.href;
                    // intent 스킴을 이용해 기본 브라우저 호출 시도 (크롬)
                    const intentUrl = `intent://${targetUrl.replace(/^https?:\/\//i, "")}#Intent;scheme=https;package=com.android.chrome;end`;
                    window.location.href = intentUrl;
                }
            }
        };

        checkUserAgent();
    }, []);

    if (!isInAppBrowser) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-white text-center">
            <div className="bg-white/10 p-8 rounded-2xl border border-white/20 max-w-sm w-full space-y-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold font-serif italic text-rose-300">
                    안전한 로그인을 위해<br />기본 브라우저를 켜주세요!
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    카카오톡, 네이버, 인스타그램 등 앱 내장 브라우저에서는<br />
                    보안 정책상 <span className="text-rose-400 font-semibold">구글, 카카오, 네이버 로그인</span>이 차단됩니다.
                </p>

                <div className="bg-black/40 p-5 rounded-xl text-left space-y-3 mt-4">
                    <p className="font-medium text-rose-200">해결 방법 ✨</p>
                    {isIOS ? (
                        <ul className="text-sm text-gray-300 space-y-2 list-disc pl-4">
                            <li>우측 하단의 <span className="text-white font-bold bg-white/20 px-1 py-0.5 rounded">나침반 아이콘</span> 또는 <span className="text-white font-bold bg-white/20 px-1 py-0.5 rounded">⠇ 메뉴</span>를 누르세요.</li>
                            <li><span className="text-white font-bold">Safari로 열기</span> 또는 <span className="text-white font-bold">다른 브라우저로 열기</span>를 선택해주세요.</li>
                        </ul>
                    ) : (
                        <ul className="text-sm text-gray-300 space-y-2 list-disc pl-4">
                            <li>우측 상단의 <span className="text-white font-bold bg-white/20 px-1 py-0.5 rounded">⁝ 메뉴</span>를 누르세요.</li>
                            <li><span className="text-white font-bold">다른 브라우저로 열기</span>를 선택해주세요.</li>
                        </ul>
                    )}
                </div>

                <p className="text-xs text-gray-400 font-mono mt-6">
                    ERR_DISALLOWED_USERAGENT
                </p>
            </div>
        </div>
    );
}
