# Developer Agent Skills — Weple Project (Next.js)

> **역할**: Full Stack Developer & System Architect
> **핵심 기술**: Next.js 14 (App Router) · TensorFlow/TypeScript · Supabase (Auth/DB/Realtime) · Tailwind CSS
> **원칙**: Server Components 우선, 타입 안정성(Type Safety), 재사용 가능한 컴포넌트 설계

---

## 1. Core Framework & Environment

### Next.js 14 (App Router)
- **App Router 구조**: `app/` 디렉토리 기반 라우팅 (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- **Rendering Modes**:
  - **RSC (React Server Components)**: 데이터 페칭, 백엔드 로직 (기본값)
  - **Client Components**: `use client`, 상태 관리(`useState`), 이벤트 핸들링
- **Server Actions**: `actions/` 폴더 내 검색/변이 로직 (API 라우트 대체)

### Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL 기반, Row Level Security (RLS) 필수 적용
- **Auth**: SSR 및 Client Side 인증 흐름 (`@supabase/ssr`)
- **Realtime**: 실시간 구독 (커뮤니티 채팅, 알림 등)

### Project Structure
```
02-next-weple/
├── app/                 # App Router (Pages & Layouts)
│   ├── (auth)/          # Route Group: login, signup
│   ├── (dashboard)/     # Route Group: main, schedule, checklist
│   ├── api/             # Route Handlers (Edge Functions)
│   └── globals.css      # Tailwind Import & Global Styles
├── components/          # React Components
│   ├── ui/              # Shadcn UI or Basic UI primitives
│   ├── dashboard/       # Dashboard specific components
│   └── ...
├── lib/                 # Utilities
│   ├── supabase/        # Client/Server clients
│   └── utils.ts         # Helper functions (cn, formatters)
├── actions/             # Server Actions (Backend Logic)
└── types/               # TypeScript Definitions
```

---

## 2. Implementation Guidelines

### 2.1 Data Fetching & State
- **Server Side**: `await supabase.from('...').select()` 직접 호출 (가장 선호)
- **Client Side**: `useEffect` + `supabaseClient` (실시간성 필요 시)
- **Caching**: Next.js `fetch` cache 또는 `unstable_cache` 활용

### 2.2 Server Actions Pattern
```typescript
// actions/todo.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTodo(formData: FormData) {
  const supabase = createClient()
  const title = formData.get('title') as string
  
  const { error } = await supabase.from('todos').insert({ title })
  
  if (!error) {
    revalidatePath('/dashboard') // UI 갱신
  }
}
```

### 2.3 Type Safety (Database Types)
- `supabase gen types`로 생성된 `Database` 타입 활용
```typescript
import { Database } from '@/types/supabase'
type Todo = Database['public']['Tables']['todos']['Row']
```

---

## 3. Database & Security

### Row Level Security (RLS)
- 모든 테이블에 RLS 활성화 필수
- 정책 예시:
  - `SELECT`: `auth.uid() = user_id` (본인 데이터만 조회)
  - `INSERT`: `auth.uid() = user_id` (본인 데이터만 생성)

### Supabase Hooks & Triggers
- **New User Trigger**: 회원가입 시 `public.profiles` 테이블 자동 행 생성

---

## 4. UI/UX Implementation (with Designer)

- **Tailwind CSS**: 유틸리티 클래스 우선 사용 (`flex items-center space-x-4`)
- **Shadcn UI / Radix primitives**: 접근성 보장된 컴포넌트 활용 권장
- **Animations**: `framer-motion` 또는 `tailwindcss-animate` 활용
- **Glassmorphism**: `.glass-panel` 등 글로벌 유틸리티 클래스 사용 (`globals.css`)

---

## 5. Deployment & Vercel

- **Environment Variables**: `.env.local` (로컬), Vercel Project Settings (배포)
- **Build Optimization**: `next.config.mjs` 이미지 도메인 허용 설정
- **Middleware**: `middleware.ts`에서 세션 갱신 및 보호된 라우트 리다이렉트 처리

---

## 6. Testing & Debugging

- **Linting**: ESLint, Prettier 규칙 준수
- **Logs**: Vercel Runtime Logs 또는 브라우저 콘솔 확인
