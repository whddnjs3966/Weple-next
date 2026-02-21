# Developer Agent Skills — Wepln Project (Next.js)

> **역할**: Full Stack Developer & System Architect
> **핵심 기술**: Next.js 14 (App Router) · TypeScript · Supabase (Auth/DB/Realtime) · Tailwind CSS · Framer Motion
> **원칙**: Server Components 우선, 타입 안정성(Type Safety), 재사용 가능한 컴포넌트 설계

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
  - **Client Components**: `'use client'`, 상태 관리(`useState`), 이벤트 핸들링
- **Server Actions**: `actions/` 폴더 내 검색/변이 로직 (API 라우트 대체)
- **Route Groups**: `(auth)`, `(dashboard)` — URL에 영향 없는 레이아웃 그룹핑

### Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL 기반, Row Level Security (RLS) 필수 적용
- **Auth**: SSR 및 Client Side 인증 흐름 (`@supabase/ssr`)
- **Realtime**: 실시간 구독 (커뮤니티 채팅, 알림 등)
- **Client 생성**:
  - 서버: `import { createClient } from '@/lib/supabase/server'`
  - 클라이언트: `import { createClient } from '@/lib/supabase/client'`

### Project Structure (실제 기준)
```
02-next-weple/
├── app/
│   ├── (auth)/          # 로그인, 회원가입
│   ├── (dashboard)/     # 메인 앱 (layout.tsx에 Navbar 포함)
│   │   ├── dashboard/   # 메인 대시보드 (Cosmos 테마)
│   │   ├── schedule/    # 일정 관리 + InteractiveTimeline
│   │   ├── checklist/   # 체크리스트 (D-Day 시스템)
│   │   ├── vendors/     # 업체 분석
│   │   └── community/   # 커뮤니티 게시판
│   ├── api/             # Route Handlers (Edge Functions)
│   └── globals.css      # Tailwind Import & Global Styles
├── components/
│   ├── dashboard/       # DashboardClient.tsx 등
│   ├── schedule/        # ScheduleClient.tsx, InteractiveTimeline.tsx
│   ├── checklist/       # ChecklistClient.tsx
│   ├── vendors/         # VendorsClient.tsx
│   ├── community/       # CommunityClient.tsx, PostDetail.tsx
│   ├── settings/        # SettingsClient.tsx
│   ├── Navbar.tsx       # 공통 네비게이션 (탭 전환)
│   ├── Particles.tsx    # 파티클 배경 (Dashboard용)
│   └── SessionGuard.tsx # 세션 보호 래퍼
├── actions/             # Server Actions
│   ├── ai.ts            # AI 웨딩 플랜 자동 생성
│   ├── budget.ts        # 예산 항목 CRUD
│   ├── checklist.ts     # 체크리스트 CRUD
│   ├── community.ts     # 게시글 CRUD
│   ├── invite.ts        # 커플 초대 코드 시스템
│   ├── profile.ts       # 프로필 업데이트
│   ├── settings.ts      # 설정 (결혼일, 이름 등)
│   └── vendors.ts       # 업체 즐겨찾기/관리
├── lib/
│   ├── supabase/        # server.ts, client.ts, middleware.ts, admin.ts
│   ├── logic/           # 비즈니스 로직 유틸
│   └── utils.ts         # cn() = clsx + tailwind-merge
├── supabase/            # DB 마이그레이션 파일 (.sql)
└── types/               # TypeScript 타입 정의
```

---

## 3. Implementation Guidelines

### 3.1 Data Fetching & State
- **Server Side**: `await supabase.from('...').select()` 직접 호출 (가장 선호)
- **Client Side**: `useEffect` + `supabaseClient` (실시간성 필요 시)
- **Caching**: Next.js `fetch` cache 또는 `unstable_cache` 활용

### 3.2 Server Actions Pattern
```typescript
// actions/checklist.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addChecklistItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title,
    is_completed: false,
    d_day: 0,
  })

  if (!error) {
    revalidatePath('/checklist') // UI 갱신
  }
  return { error: error?.message }
}
```

### 3.3 Type Safety (Database Types)
- `supabase gen types`로 생성된 `Database` 타입 활용
```typescript
import { Database } from '@/types/supabase'
type Task = Database['public']['Tables']['tasks']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
```

### 3.4 Critical Build Safety Rules (Supabase & TypeScript)

1. **Supabase Type Inference (`never` type)**:
   - `supabase-js`의 자동 추론이 `insert`, `update`, `delete` 페이로드에서 자주 실패하여 `never` 타입을 반환합니다.
   - **해결책**: 쿼리 체인이나 페이로드에 `as any`를 사용하여 빌드 에러를 방지하세요.
   - 예시: `await (supabase.from('table') as any).insert({ ... })`

2. **Strict Null Checks**:
   - `user` 객체 등 nullable 변수는 접근 전 반드시 null 체크를 수행하세요.
   - Server Component 패턴: `if (!user) redirect('/login')` 후 `user.id` 안전하게 접근.

3. **Array Type Inference (`never[]`)**:
   - Server Action의 반환값(`posts`, `tasks` 등)이 `never[]`로 추론될 경우, 사용하는 페이지에서 명시적으로 캐스팅하세요.
   - 예시: `const tasks = (await getTasks()) as unknown as Task[]`

4. **Runtime Data Mismatch**:
   - DB 테이블 정의(Types)에 없는 필드(`review_count` 등 join/computed 필드)가 런타임에 존재할 수 있습니다.
   - 컴포넌트 Props 정의 시 엄격한 타입보다는 `any` 또는 확장된 인터페이스를 사용하여 "Property does not exist" 빌드 에러를 예방하세요.

5. **Hydration Error 방지**:
   - `Math.random()`, `Date.now()` 등 비결정적 값은 서버/클라이언트 불일치를 유발합니다.
   - **해결책**: 시드 기반 결정적 로직 사용 또는 `useEffect` 내에서만 실행.
   - 예시: `const colorIndex = item.id.charCodeAt(0) % colors.length`

---

## 4. Database & Security

### Row Level Security (RLS)
- 모든 테이블에 RLS 활성화 필수
- 정책 예시:
  - `SELECT`: `auth.uid() = user_id` (본인 데이터만 조회)
  - `INSERT`: `auth.uid() = user_id` (본인 데이터만 생성)
  - `UPDATE`: `auth.uid() = user_id`
  - `DELETE`: `auth.uid() = user_id`

### Supabase Hooks & Triggers
- **New User Trigger**: 회원가입 시 `public.profiles` 테이블 자동 행 생성
- **Invite System**: `invite.ts` — 커플 초대 코드 생성 및 그룹 연결 로직

### 핵심 테이블 구조
```sql
-- profiles (User 1:1)
profiles: id(uuid PK), user_id(uuid FK), name(text), role(text), wedding_date(date)

-- tasks (체크리스트)
tasks: id(uuid PK), user_id(uuid FK), title(text), d_day(int), 
       estimated_budget(int), is_completed(bool), scheduled_date(date)

-- schedules (일정)
schedules: id(uuid PK), user_id(uuid FK), title(text), date(date), type(text)

-- community_posts (커뮤니티)
community_posts: id(uuid PK), user_id(uuid FK), title(text), content(text), 
                 created_at(timestamptz), view_count(int), like_count(int)
```

---

## 5. AI Features (actions/ai.ts)

- **웨딩 플랜 자동 생성**: `generateWeddingPlan(planData)` — 결혼일, 예산, 스타일 기반으로 체크리스트 자동 생성
- **예산 분배 로직**: 웨딩홀 50%, 스드메 15%, 신혼여행 20%, 기타 15%
- **스타일별 태스크**: Dark/Garden 등 스타일 선택에 따른 맞춤 태스크 생성

---

## 6. UI/UX Implementation (with Designer)

- **Tailwind CSS**: 유틸리티 클래스 우선 사용 (`flex items-center space-x-4`)
- **Shadcn UI / Radix primitives**: 접근성 보장된 컴포넌트 활용 권장
- **Animations**: `framer-motion` 또는 `tailwindcss-animate` 활용
- **Glassmorphism**: `bg-white/10 backdrop-blur-md border border-white/20` (Dashboard)
- **Spring Theme**: `bg-cream shadow-card rounded-2xl` (일반 페이지)

---

## 7. Deployment & Vercel

- **Environment Variables**: `.env.local` (로컬), Vercel Project Settings (배포)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (서버 전용)
- **Build Optimization**: `next.config.ts` 이미지 도메인 허용 설정
- **Middleware**: `middleware.ts`에서 세션 갱신 및 보호된 라우트 리다이렉트 처리

---

## 8. Testing & Debugging

- **Linting**: ESLint, Prettier 규칙 준수 (`npm run lint`)
- **Build Check**: `npm run build` — 타입 에러 및 빌드 오류 사전 차단
- **Logs**: Vercel Runtime Logs 또는 브라우저 콘솔 확인
- **Build Error Logs**: 프로젝트 루트의 `build_error.log`, `build_error_2.log` 참조

---

## 9. Troubleshooting Quick Reference

| 에러 | 원인 | 해결책 |
|---|---|---|
| Hydration Error | 서버/클라이언트 렌더링 불일치 | `useEffect` 내에서 렌더링 또는 결정적 로직 사용 |
| `'use client'` Error | Server Component에서 Hook 사용 | 파일 최상단에 `'use client'` 추가 |
| RLS Error | 데이터 조회/저장 불가 | Supabase 대시보드에서 RLS 정책 확인 |
| `never` Type Error | Supabase 타입 추론 실패 | `as any` 또는 명시적 타입 캐스팅 |
| Build Error | TypeScript 타입 불일치 | `build_error.log` 확인 후 타입 수정 |
