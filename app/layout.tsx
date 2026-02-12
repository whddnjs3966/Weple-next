import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wepln - 웨딩 플래너",
  description: "당신만의 완벽한 웨딩을 위한 스마트 플래너",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="font-pretendard antialiased bg-[#fdfbf7] text-gray-900">
        {children}
      </body>
    </html>
  );
}
