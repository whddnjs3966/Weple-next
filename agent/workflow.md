# Wepln Development Workflow (Next.js)

> **개발부장(Developer)**, **디자인부장(Designer)**, **기획부장(Planner)** 의 협업 워크플로우입니다.
> **기술 스택**: Next.js 14, Supabase, Tailwind CSS, Framer Motion, Vercel

---

## 1. Feature Lifecycle — 기능 개발 주기

### Step 1. 기획 및 분석 (Planning)
- **기획부장**: `agent/plan/skills.md`에 따라 요구사항 분석 및 스펙(User Story) 작성.
- **데이터 설계**: 필요한 Supabase 테이블, RLS 정책 검토.
- **UI 설계**: 필요한 페이지 라우트(`app/...`)와 컴포넌트 구조 정의.
- **현황 파악**: `agent/plan/skills.md`의 "Current Feature Status" 표를 먼저 확인하여 중복 개발 방지.

### Step 2. 데이터베이스 마이그레이션 (DB Layer)
- **개발부장**:
  1. `supabase/` 폴더에 `.sql` 마이그레이션 파일 작성.
  2. Supabase 대시보드 또는 로컬 마이그레이션을 통해 테이블 생성/수정.
  3. `npx supabase gen types typescript --project-id ... > types/supabase.ts` 실행하여 타입 정의 업데이트.
  4. RLS 정책 적용 확인.

### Step 3. 백엔드/로직 구현 (Logic Layer)
- **개발부장**:
  1. `actions/` 폴더에 Server Action 함수 작성 (`'use server'`).
  2. 데이터 페칭 함수 작성 (`lib/supabase/server.ts` 활용).
  3. 타입 안정성(Type Safety) 검증 (`npm run build`로 확인).

### Step 4. UI/UX 구현 (UI Layer)
- **디자인부장**:
  1. `components/` 폴더에 재사용 가능한 UI 컴포넌트 작성/수정.
  2. `app/(dashboard)/` 라우트 페이지 구성 (`page.tsx`, `layout.tsx`).
  3. Tailwind CSS 스타일링 및 반응형 적용 (Mobile First).
  4. 클라이언트 인터랙션 (`'use client'`, `useState`) 구현.
  5. **Hydration 주의**: `Math.random()` 등 비결정적 로직 사용 금지.

### Step 5. 통합 및 검증 (QA)
- **전체**:
  1. 로컬 개발 환경(`npm run dev`)에서 기능 테스트.
  2. 빌드 테스트 (`npm run build`)로 타입 에러 및 빌드 오류 사전 차단.
  3. 에러 발생 시 `build_error.log` 확인.
  4. Vercel Preview 배포 확인 (선택 사항).

---

## 2. Collaboration Points — 협업 가이드

### 2.1 개발부장 ↔ 디자인부장
- **데이터 전달**: Server Component에서 fetch한 데이터를 Client Component의 props로 전달.
  - *개발부장*: "이 페이지에서 `tasks` 배열과 `userProfile` 객체를 props로 넘겨줍니다."
  - *디자인부장*: "그럼 제가 `interface Props` 정의하고 UI 맵핑하겠습니다."
- **Server Actions**:
  - *디자인부장*: "폼 제출 시 이 데이터를 저장해야 해요."
  - *개발부장*: "여기 `actions/checklist.ts`의 `addChecklistItem(formData)` 액션을 import해서 `form action`에 연결하세요."
- **컴포넌트 명명 규칙**:
  - Client Component: `XxxClient.tsx` (예: `ChecklistClient.tsx`, `ScheduleClient.tsx`)
  - Server Component: `XxxPage.tsx` 또는 `page.tsx`

### 2.2 기획부장 ↔ 개발/디자인
- **기획 변경 시**: 즉시 알리고, 영향 범위(DB 스키마, 기 개발된 UI)를 파악하여 전파.
- **우선순위 조정**: 기술적 난이도나 일정 이슈 발생 시 스펙 조정(Negotiation).
- **Gap Analysis 업데이트**: 기능 구현 완료 시 `agent/plan/skills.md`의 현황 표 업데이트.

---

## 3. Development Commands

| 동작 | 명령어 | 비고 |
|---|---|---|
| **개발 서버 시작** | `npm run dev` | `http://localhost:3000` |
| **프로덕션 빌드** | `npm run build` | 타입 체크 및 최적화 수행 |
| **프로덕션 실행** | `npm start` | 빌드된 산출물 실행 |
| **Lint 검사** | `npm run lint` | 코드 스타일 위반 확인 |
| **DB 타입 생성** | `npx supabase gen types typescript --project-id <id> > types/supabase.ts` | Supabase 스키마 변경 후 실행 |

---

## 4. File Structure Ownership

| 경로 | 주 담당 | 설명 |
|---|---|---|
| `app/**/page.tsx` | 🤝 공동 | 라우트 정의 및 데이터-UI 통합 |
| `app/api/**` | 🔧 개발 | API 라우트 (필요 시) |
| `actions/**` | 🔧 개발 | 서버 액션 (비즈니스 로직) |
| `components/**` | 🎨 디자인 | UI 컴포넌트 |
| `app/globals.css` | 🎨 디자인 | 전역 스타일, Tailwind 설정 |
| `lib/supabase/**` | 🔧 개발 | Supabase 클라이언트 설정 |
| `types/**` | 🔧 개발 | TypeScript 타입 정의 |
| `tailwind.config.ts` | 🎨 디자인 | 디자인 토큰 설정 |
| `next.config.ts` | 🔧 개발 | Next.js 빌드 설정 |
| `supabase/**` | 🔧 개발 | DB 마이그레이션 파일 |
| `agent/**` | 📋 기획 | 에이전트 정의 및 워크플로우 |

---

## 5. Design Theme Guidelines

| 페이지 | 테마 | 배경 | 카드 스타일 |
|---|---|---|---|
| Dashboard | **Cosmos** | Dark Gradient + Particles | Glassmorphism (`bg-white/10 backdrop-blur-md`) |
| Schedule | **Spring** | Blush (`#FDF2F8`) + 웨딩 사진 | 크림 카드 (`bg-cream shadow-card`) |
| Checklist | **Spring** | Blush (`#FDF2F8`) | 크림 카드 (`bg-cream shadow-card`) |
| Vendors | **Spring** | Blush (`#FDF2F8`) | 크림 카드 (`bg-cream shadow-card`) |
| Community | **Spring** | Blush (`#FDF2F8`) | 크림 카드 (`bg-cream shadow-card`) |

---

## 6. Troubleshooting Reference

| 에러 | 원인 | 해결책 |
|---|---|---|
| **Hydration Error** | 서버 렌더링 결과와 클라이언트 초기 렌더링 불일치 | `useEffect` 내에서 렌더링하거나 결정적 로직 사용 |
| **"use client" Error** | Server Component에서 Client Hook(`useState` 등) 사용 | 파일 최상단에 `'use client'` 추가 |
| **RLS Error** | 데이터가 안 보이거나 저장이 안 됨 | Supabase 대시보드에서 RLS 정책 확인 |
| **`never` Type Error** | Supabase 타입 추론 실패 | `as any` 또는 명시적 타입 캐스팅 |
| **Build Error** | TypeScript 타입 불일치 | `build_error.log` 확인 후 타입 수정 |
| **Image Not Found** | 잘못된 이미지 경로 또는 도메인 미허용 | `next.config.ts`의 `images.domains` 확인 |
