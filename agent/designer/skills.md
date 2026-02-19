# Design Specialist Agent Skills — Wepln Project (Next.js)

> **역할**: UI/UX Designer & Frontend Specialist
> **핵심 기술**: Tailwind CSS · React/JSX · Framer Motion · Lucide React
> **원칙**: Mobile-First, 접근성(A11y), **"Romantic Spring" Design System**

---

## 1. NotebookLM Design Intelligence (Creative Engine)

> **디자인부장**은 "예쁜 디자인"을 넘어 "논리적이고 트렌디한 디자인"을 위해 NotebookLM을 활용합니다.

### 1.1 최신 웹 디자인 트렌드 파악 (Visual Trends)
- **Before Design**: 작업을 시작하기 전, 반드시 최신 트렌드를 파악하십시오.
- **Action**:
  - `mcp_notebooklm_ask_question`: "2024-2025 웹 디자인 트렌드(Glassmorphism, Bento Grids, Aurora UI)의 진화 방향은?"
  - `mcp_notebooklm_ask_question`: "사용자에게 감동을 주는 마이크로 인터랙션(Micro-interactions) 사례 알려줘."

### 1.2 창조적 레퍼런스 발굴 (Inspiration Mining)
- **목표**: 뻔한 웨딩 앱 디자인 탈피. "와우 포인트" 발굴.
- **Action**:
  - "봄날 벚꽃 컨셉과 웨딩을 결합한 독창적인 컬러 팔레트와 UI 구성 아이디어 제안해줘."
  - "모바일에서 긴 체크리스트를 지루하지 않게 보여주는 게이미피케이션 UI 사례는?"
  - "웨딩 플래너 앱에서 D-Day 카운터를 감성적으로 표현하는 방법은?"

---

## 2. Visual Identity & Design System

### 2.1 Concept: "Romantic Spring"
- **Keywords**: Blossom, Soft, Elegant, Warm, Romantic
- **Visuals**:
  - **Background (일반 페이지)**: Warm Blush Gradient (`#FDF2F8`) + 벚꽃 이미지 오버레이
  - **Background (Dashboard)**: "Cosmos" — Deep Space Gradient + Particles (`Particles.tsx`)
  - **Cards**: 부드러운 흰색 카드 (`bg-cream`, `shadow-card`) 또는 Glassmorphism
  - **Motion**: `petal-fall`, `float`, `bloom`, `fade-in-up` 애니메이션 활용

### 2.2 Color Palette (실제 `tailwind.config.ts` 기준)

| 토큰 | 값 | 용도 |
|---|---|---|
| `primary` | `#F9A8D4` (pink-300) | 주요 버튼, 강조 텍스트 |
| `primary-hover` | `#F472B6` (pink-400) | 호버 상태 |
| `primary-light` | `#FBCFE8` (pink-200) | 배지, 태그 배경 |
| `blush` / `background` | `#FDF2F8` | 페이지 배경 |
| `cream` | `#FFFBF0` | 카드 배경 |
| `gold` | `#D4A373` | 반지/링 아이콘, 프리미엄 강조 |
| `sage` | `#A7C4A0` | 완료 상태, 성공 표시 |
| `text-dark` | `#1F2937` | 본문 텍스트 |
| `text-muted` | `#6B7280` | 보조 텍스트, 플레이스홀더 |

> **주의**: `#FF8E8E` (구 Coral)는 더 이상 사용하지 않습니다. `primary` (`#F9A8D4`)를 사용하십시오.

### 2.3 Typography (폰트)

| 폰트 | Tailwind 클래스 | 용도 |
|---|---|---|
| Pretendard | `font-pretendard` | 기본 본문, UI 텍스트 |
| Cormorant Garamond | `font-serif` | 우아한 제목, 탭 타이틀 |
| Dancing Script | `font-cursive` | 장식적 텍스트, 로고 |
| Cinzel | `font-cinzel` | 프리미엄 헤딩 |

### 2.4 Animations (`tailwind.config.ts` 정의 목록)

| 클래스 | 효과 | 주요 사용처 |
|---|---|---|
| `animate-petal-fall` | 꽃잎 낙하 | 배경 장식 |
| `animate-bloom` | 꽃 피는 등장 효과 | 아이콘, 버튼 |
| `animate-fade-in-up` | 아래서 위로 등장 | 카드, 섹션 |
| `animate-float` | 둥둥 부유 | 플로팅 카드, 아이콘 |
| `animate-sway` | 좌우 흔들림 | 장식 요소 |
| `animate-shimmer` | 빛나는 shimmer | 로딩 스켈레톤 |
| `animate-pulse-soft` | 부드러운 맥박 | D-Day 강조, 알림 |

---

## 3. Tailwind CSS Implementation

### 3.1 Core Utilities
- **Layout**: `flex`, `grid`, `absolute`, `relative`, `z-index`
- **Spacing**: `p-4`, `m-2`, `gap-4` (4px grid system)
- **Glassmorphism (Dashboard/Cosmos)**:
  ```tsx
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg">
    Content
  </div>
  ```
- **일반 카드 (Spring 테마)**:
  ```tsx
  <div className="bg-cream rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6">
    Content
  </div>
  ```

### 3.2 Custom Shadows & Borders
- `shadow-petal`: 핑크 글로우 그림자 (카드 기본)
- `shadow-card`: 부드러운 카드 그림자
- `shadow-card-hover`: 호버 시 강조 그림자
- `shadow-ring-glow`: 골드 글로우 (반지/특별 요소)
- `shadow-rose-glow`: 핑크 글로우 (강조 버튼)
- `rounded-card` (16px), `rounded-2xl` (24px), `rounded-3xl` (32px)

### 3.3 Custom Animations (`tailwind.config.ts`)
- `animate-float`: 둥둥 떠다니는 부유 효과
- `animate-petal-fall`: 꽃잎이 떨어지는 배경 효과
- `animate-fade-in-up`: 콘텐츠 등장 효과
- `animate-shimmer`: 로딩 스켈레톤 shimmer

---

## 4. React/Next.js Component Design

### 4.1 Component Structure
- **Client Components** (`'use client'`):
  - 인터랙션이 있는 UI (버튼, 폼, 탭, 모달)
  - `useState`, `useEffect` 사용 필수
  - 파일명 컨벤션: `XxxClient.tsx` (예: `ChecklistClient.tsx`)
- **Server Components**:
  - 정적 레이아웃, 데이터 표시용 UI
  - 클라이언트 로직 최소화로 성능 최적화

### 4.2 Responsive Design
- **Mobile First**: 기본 클래스는 모바일 기준
- **Breakpoints**: `md:` (Tablet 768px), `lg:` (Desktop 1024px)
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* ... */}
  </div>
  ```

### 4.3 Icons
- **Lucide React** 사용 권장
  ```tsx
  import { Heart, Calendar, CheckCircle } from 'lucide-react'
  <Heart className="w-5 h-5 text-primary fill-current" />
  ```

### 4.4 Hydration 주의사항
- `Math.random()`, `Date.now()` 등 비결정적 값은 Server/Client 렌더링 불일치 유발
- **해결책**: `useEffect` 내에서만 사용하거나, 시드 기반 결정적 로직으로 대체
  ```tsx
  // ❌ 잘못된 예
  const color = colors[Math.floor(Math.random() * colors.length)]
  // ✅ 올바른 예 (id 기반 결정적 선택)
  const color = colors[item.id % colors.length]
  ```

---

## 5. UI Components Guidelines

### 5.1 Modals
- `Radix UI Dialog` 또는 커스텀 절대 위치 오버레이 사용
- 배경: `bg-black/50 backdrop-blur-sm`
- 등장 애니메이션 필수 (`animate-fade-in-up` 또는 Framer Motion)
- 모달 내부: `bg-white rounded-3xl shadow-2xl p-6`

### 5.2 Bento Grid (Dashboard)
- CSS Grid 활용
- 다양한 크기의 카드가 유기적으로 배치되도록 `col-span-` 활용
- 대시보드는 "Cosmos" 테마 (어두운 배경 + Glassmorphism 카드)
- 일반 페이지는 "Spring" 테마 (밝은 배경 + 크림색 카드)

### 5.3 Timeline (Schedule)
- SVG 활용한 곡선(Bezier Curve) 표현 (`InteractiveTimeline.tsx`)
- Framer Motion으로 path drawing 애니메이션 구현
- 반응형 대응 시 SVG 좌표 재계산 로직 고려
- D-Day 라벨 표시 (예: "D-30", "D-100")

### 5.4 Table (Checklist / Community)
- 헤더: `bg-pink-50 text-gray-700 font-semibold`
- 행 호버: `hover:bg-pink-50/50 transition-colors`
- 완료 항목: `line-through text-gray-400` + `text-sage` 체크 아이콘

### 5.5 D-Day Badge
- 긴박함 표현을 위한 색상 코딩:
  ```tsx
  const getDDayColor = (dDay: number) => {
    if (dDay <= 7) return 'bg-red-100 text-red-600'    // 긴급
    if (dDay <= 30) return 'bg-orange-100 text-orange-600' // 주의
    if (dDay <= 90) return 'bg-yellow-100 text-yellow-600' // 여유
    return 'bg-green-100 text-green-600'                // 충분
  }
  ```

---

## 6. CSS Architecture

- **Global Styles**: `app/globals.css`에는 리셋 및 글로벌 변수만 정의
- **Modular Styles**: 가능한 모든 스타일을 Tailwind Utility Class로 작성
- **`cn` Utility**: 클래스 병합 시 `clsx` + `tailwind-merge` (`lib/utils.ts`) 사용
  ```tsx
  import { cn } from '@/lib/utils'
  <div className={cn("p-4 bg-white", isActive && "bg-primary/10")}>
  ```

---

## 7. Collaboration with Developer

- **To Developer**:
  - 필요한 **데이터 Props** 정의 (`interface Props { ... }`)
  - **Server Action**이 필요한 인터랙션(폼 제출 등) 요청
  - **Visual Verification**: 디자인한 컴포넌트가 실제 데이터(DB 필드)와 일치하는지 확인
    - 예: `VendorCard`에 `review_count`가 필요한데 DB 타입에 없다면 개발자에게 알림
- **Handling Data**:
  - 로딩 상태 (`animate-shimmer` 스켈레톤), 에러 상태 (`error.tsx`) UI 반드시 디자인
  - `Suspense` 경계 설정 고려
  - 빈 상태(Empty State) UI도 디자인 (예: "아직 일정이 없어요 🌸")
