# Design Specialist Agent Skills — Wepln Project (Next.js)

> **역할**: UI/UX Designer & Frontend Specialist
> **핵심 기술**: Tailwind CSS · React/JSX · Framer Motion · Figma (Conceptual)
> **원칙**: Mobile-First, 접근성(A11y), **"Cosmos" Design System (Glassmorphism)**

---

## 1. Visual Identity & Design System

### 1.1 Concept: "Romantic Cosmos"
- **Keywords**: Dreamy, Space, Glass, Soft Coral, Floating
- **Visuals**:
  - **Background**: Deep Space Gradient + Particles + Soft Overlays
  - **Cards**: Glassmorphism (Blur, Semi-transparent White/Dark)
  - **Motion**: Floating animations, Slow zooms, Smooth transitions

### 1.2 Color Palette (Tailwind Config)
`tailwind.config.ts`에 정의된 변수를 사용하십시오:
- **Primary**: `text-primary`, `bg-primary` (`#FF8E8E`)
- **Surface**: `bg-white/10`, `bg-black/20` (Glass effects)
- **Text**: `text-gray-900` (Light Mode), `text-white` (Dark Mode/Cosmos)

### 1.3 Typography
- **Font**: `Pretendard` (via Next.js `next/font` or CDN)
- **Headings**: `font-serif` (Playfair Display) for elegant titles.

---

## 2. Tailwind CSS Implementation

### 2.1 Core Utilities
- **Layout**: `flex`, `grid`, `absolute`, `relative`, `z-index`
- **Spacing**: `p-4`, `m-2`, `gap-4` (4px grid system)
- **Glassmorphism**:
  ```tsx
  <div className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg">
    Content
  </div>
  ```

### 2.2 Custom Animations (`tailwind.config.ts`)
- `animate-float`: 둥둥 떠다니는 부유 효과
- `animate-slow-zoom`: 배경 이미지의 천천히 확대되는 효과
- `animate-fade-in-up`: 콘텐츠 등장 효과

---

## 3. React/Next.js Component Design

### 3.1 Component Structure
- **Client Components** (`'use client'`):
  - 인터랙션이 있는 UI (버튼, 폼, 탭, 모달)
  - `useState`, `useEffect` 사용 필수
- **Server Components**:
  - 정적 레이아웃, 데이터 표시용 UI
  - 클라이언트 로직 최소화로 성능 최적화

### 3.2 Responsive Design
- **Mobile First**: 기본 클래스는 모바일 기준
- **Breakpoints**: `md:` (Tablet), `lg:` (Desktop)
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* ... */}
  </div>
  ```

### 3.3 Icons
- **Lucide React** 사용 권장
  ```tsx
  import { Heart, Calendar } from 'lucide-react'
  <Heart className="w-5 h-5 text-primary fill-current" />
  ```

---

## 4. UI Components Guidelines

### 4.1 Modals
- `Radix UI Dialog` 또는 커스텀 절대 위치 오버레이 사용
- 배경: `bg-black/50 backdrop-blur-sm`
- 등장 애니메이션 필수

### 4.2 Bento Grid (Dashboard)
- CSS Grid 활용
- 다양한 크기의 카드가 유기적으로 배치되도록 `col-span-` 활용

### 4.3 Timeline (Schedule)
- SVG 활용한 곡선(Bezier Curve) 표현
- 반응형 대응 시 SVG 좌표 재계산 로직 고려

---

## 5. CSS Architecture

- **Global Styles**: `app/globals.css`에는 리셋 및 글로벌 변수만 정의
- **Modular Styles**: 가능한 모든 스타일을 Tailwind Utility Class로 작성
- **`cn` Utility**: 클래스 병합 시 `clsx` + `tailwind-merge` (`lib/utils.ts`) 사용
  ```tsx
  <div className={cn("p-4 bg-white", isActive && "bg-blue-500")}>
  ```

---

## 6. Collaboration with Developer

- **To Developer**:
  - 필요한 **데이터 Props** 정의 (`interface Props { ... }`)
  - **Server Action**이 필요한 인터랙션(폼 제출 등) 요청
- **Handling Data**:
  - 로딩 상태 (`skeletons`), 에러 상태 (`error.tsx`) UI 반드시 디자인
  - `Suspense` 경계 설정 고려
