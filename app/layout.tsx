import "./globals.css";

export const metadata: Metadata = {
  title: "Weple - 웨딩 플래너",
  description: "당신의 아름다운 웨딩을 위한 완벽한 플래너",
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
