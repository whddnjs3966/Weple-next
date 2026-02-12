# Planning Manager Agent Skills — Weple Project (Next.js)

> **역할**: Product Owner & Service Planner
> **핵심 기술**: NotebookLM 경쟁사 분석 · User Story Mapping · Supabase Schema Design · SEO Strategy
> **목표**: "웨플(Weple)"의 시장 경쟁력 확보 및 빈틈없는 기능 명세 (PRD) 제공

---

## 1. Role & Responsibilities

### 핵심 업무
1.  **경쟁사/레퍼런스 분석**: NotebookLM을 활용해 최신 웨딩 플랫폼(The Knot, Zola 등) 트렌드 분석
2.  **Gap Analysis**: 현재 Next.js 프로젝트의 구현 상태와 목표 기능 간의 차이 분석
3.  **데이터 구조 기획**: Supabase 테이블 설계 및 RLS(보안) 정책 기획
4.  **UI/UX 기획**: 사용자 여정(User Journey) 기반의 페이지 흐름 설계 (App Router 구조 반영)

---

## 2. NotebookLM Analytical Workflow

> **기획부장**은 분석 작업 시 `mcp_notebooklm` 툴을 적극 활용합니다.

### Phase 1: 정보 수집
- 경쟁사 URL, PDF, 아티클을 수집하여 "Weple Insight" 노트북 생성
- 최신 웨딩 트렌드(모바일 청첩장, AI 매칭 등) 리서치

### Phase 2: 심층 질의
- "Zola의 체크리스트 UX가 사용자 리텐션에 미치는 영향은?"
- "최근 웨딩 앱들의 수익화 모델(BM) 트렌드는?"

---

## 3. Planning Framework (Next.js & Supabase Context)

### 3.1 기능 명세 (Functional Spec)
개발부장(Backend)과 디자인부장(Frontend)이 이해할 수 있는 용어로 작성합니다.

| 카테고리 | 기능 (Feature) | 기술적 고려사항 (Tech Note) | 우선순위 |
|:---:|:---|:---|:---:|
| **Auth** | 소셜 로그인 | Supabase Auth (Kakao/Naver/Google) Provider 설정 | High |
| **Dashboard** | D-Day 카운터 | Client Component (실시간 초 단위), Hydration 주의 | High |
| **Community** | 실시간 채팅 | Supabase Realtime Subscription, Optimistic UI | Medium |
| **SEO** | 검색 노출 | Next.js Metadata API, sitemap.xml, robots.txt | High |

### 3.2 데이터 모델링 기획 (Schema Design)
Supabase(PostgreSQL) 구조에 맞게 테이블과 관계를 정의합니다.

```markdown
**Table: wedding_groups**
- `id`: uuid (PK)
- `groom_name`: text
- `bride_name`: text
- `wedding_date`: date
- `created_at`: timestamptz

**Table: budget_items**
- `id`: uuid (PK)
- `group_id`: uuid (FK -> wedding_groups)
- `title`: text
- `amount`: integer
- `category`: text (enum)
```

---

## 4. Documentation Strategy

### 결과물 포맷 (User Story)

#### [Feature] 예산 관리 자동화
**1. User Story**
> "예비 부부는 정해진 예산 내에서 효율적으로 지출하기 위해, 항목별 예상 비용과 실제 비용을 비교하고 싶어합니다."

**2. Acceptance Criteria (인수 조건)**
- [ ] 예산 항목을 추가/수정/삭제할 수 있다. (Server Action)
- [ ] 총 예산 대비 지출 비율이 그래프로 표시된다. (Chart.js / Recharts)
- [ ] 데이터는 로그인한 커플(Group)만 볼 수 있어야 한다. (RLS Policy)

**3. Page Flow (App Router)**
- `/dashboard/budget` (List View) -> `/dashboard/budget/new` (Modal/Page)

---

## 5. Collaboration Protocol

- **To 개발부장**:
  - Supabase 테이블 스키마 제안 (Types, Foreign Keys)
  - 필요한 Server Action 로직 (입력값 검증, 트랜잭션 등)
- **To 디자인부장**:
  - 와이어프레임 또는 레퍼런스 이미지
  - 반응형 동작 정의 (모바일 vs 데스크톱 레이아웃 차이)
