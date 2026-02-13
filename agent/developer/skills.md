# Developer Agent Skills — Wepln Project (Next.js)

> **역할**: Full Stack Developer & System Architect
> **핵심 기술**: Next.js 14 (App Router) · TensorFlow/TypeScript · Supabase (Auth/DB/Realtime) · Tailwind CSS
> **원칙**: Server Components 우선, 타입 안정성(Type Safety), 재사용 가능한 컴포넌트 설계

---

---

## 1. NotebookLM Technical Intelligence (Knowledge Base)

> **개발부장**은 "동작하는 코드"를 넘어 "보안이 완벽하고 유지보수 가능한 코드"를 위해 NotebookLM을 **Second Brain**으로 활용합니다.

### 1.1 기술적 코딩 & 최신 패턴 (Modern Best Practices)
- **Code with CI (Collective Intelligence)**:
  - `mcp_notebooklm_ask_question`: "Next.js 14 App Router에서 Server Actions와 Supabase를 사용할 때 가장 안전한 패턴은?"
  - `mcp_notebooklm_ask_question`: "React Server Components(RSC)에서 불필요한 리렌더링을 막는 최적화 기법은?"

### 1.2 보안 이슈 및 오류 사전 방지 (Proactive Security)
- **Security First**: 코드를 작성하기 전, 잠재적 위험을 먼저 파악하십시오.
- **Action**:
  - "Supabase RLS 정책 작성 시 흔히 저지르는 실수와 보안 구멍(Security Holes) 사례 알려줘."
  - "Next.js Middleware에서 세션 탈취를 방지하기 위한 보안 헤더 설정 방법은?"

### 1.3 코드 오류 방지 및 디버깅 (Error Prevention)
- **Anti-Pattern Check**:
  - "Next.js Hydration Error(`Text content does not match`)가 발생하는 주요 원인과 해결책 리스트업 해줘."
  - "Supabase `never` 타입 에러를 우회하면서도 타입 안정성을 지키는 방법은?"

---

## 2. Core Framework & Environment

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

### 2.4 Critical Build Safety Rules (Supabase & TypeScript)
1.  **Supabase Type Inference (`never` type)**:
    - `supbase-js`의 자동 추론이 `insert`, `update`, `delete` 페이로드에서 자주 실패하여 `never` 타입을 반환합니다.
    - **해결책**: 쿼리 체인이나 페이로드에 `as any`를 사용하여 빌드 에러를 방지하세요.
    - 예시: `await (supabase.from('table') as any).insert({ ... })`
2.  **Strict Null Checks**:
    - `user` 객체 등 nullable 변수는 접근 전 반드시 null 체크를 수행하세요.
    - Server Component 패턴: `if (!user) redirect('/login')` 후 `user.id` 안전하게 접근.
3.  **Array Type Inference (`never[]`)**:
    - Server Action의 반환값(`posts`, `tasks` 등)이 `never[]`로 추론될 경우, 사용하는 페이지에서 명시적으로 캐스팅하세요.
    - 예시: `const tasks = (await getTasks()) as unknown as any[]`
4.  **Runtime Data Mismatch**:
    - DB 테이블 정의(Types)에 없는 필드(`review_count` 등 join/computed 필드)가 런타임에 존재할 수 있습니다.
    - 컴포넌트 Props 정의 시 엄격한 타입보다는 `any` 또는 확장된 인터페이스를 사용하여 "Property does not exist" 빌드 에러를 예방하세요.

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
