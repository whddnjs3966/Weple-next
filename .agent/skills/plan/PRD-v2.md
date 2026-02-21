# Wepln PRD v2 — 핵심 로직 설계서

> 작성: 기획부장 | 참고: 웨딩북, 아이웨딩, Zola, The Knot, 푸딩(AI)
> 대상 개발: 개발부장(Backend) + 디자인부장(Frontend)

---

## 0. 경쟁사 핵심 인사이트 요약

| 서비스 | 킬러 기능 | Wepln 적용 포인트 |
|---|---|---|
| **웨딩북** | 스드메 즉시 비교·예약, 플래너 1:1 매칭, 펀딩형 청첩장 | 업체 즐겨찾기 + 비교 UX |
| **아이웨딩** | 견적 한눈에 비교, 실시간 상담, 체크리스트+예산 통합 | 내가 선택한 업체 → 예산 자동 연동 |
| **Zola** | 레지스트리, 상세 RSVP 설정, 수백 개 테마 | 커플 데이터 공유 UX |
| **The Knot** | 업체 검색·비교·예약 원스탑, 좌석 배치도 | 지역 기반 업체 탐색 |
| **푸딩(AI)** | AI 예산 설계, 온라인 축의대 | AI 업체 추천 로직 |

**차별화 방향**: "AI가 설계해주는 커플 공유 웨딩 플래너" — 국내 지역 기반 업체 검색 + AI 추천 + 커플 데이터 실시간 공유

---

## 1. 수정 로직 4가지 상세 설계

---

### 1-1. Header Nav 설정 버튼 — 이름 자동 표시 + 예식일 자동 표기

#### 현재 문제
- 설정 모달에 닉네임 수동 입력 필요 (소셜 로그인 이름 미반영)
- 결혼 예정일이 onboarding 후에도 설정 모달에 비어있는 경우 발생

#### 개선 스펙

**Navbar 우측 설정 버튼:**
```
[ ⚙️ 홍길동 ]  →  클릭 시 설정 모달 오픈
```
- 버튼 레이블에 `profiles.full_name` 표시 (없으면 이메일 앞부분)
- 소셜 로그인 시 OAuth provider의 `user_metadata.name` → `profiles.full_name` 자동 저장 (DB 트리거로 처리)

**설정 모달 개선:**
```
┌─────────────────────────────────┐
│ 👤 내 정보                      │
├─────────────────────────────────┤
│ 이름: [ 홍길동          ]        │ ← OAuth 이름 자동 표기, 수정 가능
│ 예식일: [ 2026. 06. 15  ]       │ ← onboarding 입력값 자동 표기, 수정 가능
│ 결혼 장소: [ 서울 강남구 ]       │ ← onboarding 입력값 자동 표기
├─────────────────────────────────┤
│ 파트너 초대코드                  │
│ [ ABC-12345 ]  [📋 복사]        │
│ 또는 [초대코드로 파트너 연결하기] │
└─────────────────────────────────┘
```

#### 구현 위치
- `components/Navbar.tsx` — 버튼 레이블에 nickname 표시 추가
- `components/settings/SettingsModal.tsx` — 결혼 장소 필드 추가, OAuth 이름 자동 로드
- `actions/settings.ts` — `getFullProfile()` 함수 추가 (이름+날짜+장소 한번에 조회)

---

### 1-2. 최초 로그인 시 초대코드 자동 생성

#### 현재 문제
- `generateInviteCode()`는 구현되어 있으나, 최초 로그인 시 자동 호출되지 않음
- 사용자가 설정 모달을 열기 전까지 초대코드가 없는 상태

#### 개선 스펙

**자동 생성 타이밍:**
```
온보딩 완료(Step 3 Submit) → generateInviteCode() 자동 호출
                          → profiles.invite_code 저장
                          → /dashboard로 이동
```

**파트너 연결 흐름 (완전 명세):**
```
User A (먼저 가입)
  └─ 온보딩 완료 → 초대코드 자동 생성 (예: "WEPLN-A8X2")
  └─ 설정 모달 → 초대코드 확인 → 파트너에게 공유

User B (초대받음)
  └─ 로그인 → 온보딩 Step 0: "초대코드로 참여" 선택
  └─ 코드 입력 → 실시간 유효성 검증 (validateInviteCode)
  └─ 파트너 이름 미리보기: "홍길동님의 초대코드입니다 ✓"
  └─ 연결 완료 → joinByInviteCode() 실행
     ├─ User A, B → 동일 wedding_group_id
     ├─ 모든 tasks, schedules, vendors 데이터 공유
     └─ /dashboard로 이동 (파트너 D-Day 카운터 표시)
```

**데이터 공유 범위 (wedding_group_id 기반):**
| 데이터 | 공유 여부 | 비고 |
|---|---|---|
| 체크리스트 (tasks) | ✅ 공유 | group_id로 조회 변경 필요 |
| 일정 (schedules) | ✅ 공유 | group_id로 조회 변경 필요 |
| 업체 선택 | ✅ 공유 | user_vendors에 group_id 추가 |
| 예산 | ✅ 공유 | wedding_groups.total_budget 사용 |
| 커뮤니티 게시글 | ❌ 개인 | user_id 기준 유지 |

#### 구현 위치
- `app/(auth)/onboarding/page.tsx` — Step 3 submit 후 `generateInviteCode()` 호출 추가
- `actions/checklist.ts` — `getTasks()` 쿼리를 `wedding_group_id` 기반으로 수정
- `actions/budget.ts` — `getBudgetSummary()` 쿼리를 `wedding_group_id` 기반으로 수정
- `supabase/migrations/` — tasks, schedules에 `group_id` 컬럼 추가 마이그레이션

---

### 1-3. Dashboard 데이터 연동 (예산·체크리스트 수행률 정확화)

#### 현재 문제
- Dashboard의 예산 `used`가 `tasks.actual_cost` 합산이나 `budgetSummary.actualTotal` 중 하나만 사용
- 체크리스트 수행률이 파트너 데이터 포함 안 됨
- Vendors에서 업체 선택해도 Dashboard 예산에 반영 안 됨

#### 개선 스펙

**예산 데이터 흐름:**
```
총 예산 (wedding_groups.total_budget)
  ↓
사용 예산 = tasks.actual_cost 합산 (그룹 전체)
         + user_vendors.price (선택한 업체 비용)
  ↓
Dashboard Budget Card = 총 예산 대비 사용 예산 %
```

**체크리스트 수행률 흐름:**
```
그룹 전체 tasks (user A + user B)
  → completed / total = 수행률 %
  → Dashboard Checklist Card에 표시
```

**Dashboard ↔ 각 탭 연동 매핑:**
| Dashboard 카드 | 데이터 소스 | 연동 탭 |
|---|---|---|
| D-Day | profiles.wedding_date | 설정 모달 |
| Budget % | tasks.actual_cost + vendors 선택 비용 | Checklist + Vendors |
| Checklist % | tasks (group 전체) | Checklist |
| 빠른 이동 링크 | 정적 | 각 탭 |

#### 구현 위치
- `actions/budget.ts` — `getBudgetSummary()`: wedding_group_id 기반 집계로 수정
- `actions/checklist.ts` — `getTasks()`: wedding_group_id가 있으면 그룹 전체 조회
- `app/(dashboard)/dashboard/page.tsx` — 데이터 fetch 로직 수정

---

### 1-4. Onboarding — 결혼 장소 추가 (시·도 + 상세 도시)

#### 현재 문제
- Onboarding Step 1~3: 날짜 / 예산 / 스타일만 입력
- 결혼 장소 정보 없음 → Vendors AI 추천, 지역 검색 불가

#### 개선 스펙

**Step 추가 (Step 2.5 위치):**
```
Step 1: 결혼 예정일
  ↓
Step 2: 예식 장소 (NEW)
  ↓
Step 3: 총 예산
  ↓
Step 4: 웨딩 스타일
```

**예식 장소 선택 UI:**
```
┌────────────────────────────────────┐
│   어디서 결혼하실 예정인가요? 💒     │
├────────────────────────────────────┤
│  시·도 선택                         │
│  ┌──────────────────────────────┐  │
│  │ [서울] [경기] [인천] [부산]   │  │
│  │ [대구] [광주] [대전] [울산]   │  │
│  │ [세종] [강원] [충북] [충남]   │  │
│  │ [전북] [전남] [경북] [경남]   │  │
│  │ [제주] [미정/기타]            │  │
│  └──────────────────────────────┘  │
│                                    │
│  상세 도시 (시·도 선택 후 표시)      │
│  ┌──────────────────────────────┐  │
│  │ [강남구] [서초구] [마포구]... │  │  ← 시도별 주요 구/군 표시
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**시도별 주요 도시 데이터 (정적 상수):**
```typescript
const WEDDING_LOCATIONS = {
  '서울': ['강남구', '서초구', '마포구', '종로구', '강서구', '송파구', '용산구', '기타'],
  '경기': ['수원시', '성남시', '용인시', '고양시', '부천시', '안양시', '기타'],
  '부산': ['해운대구', '수영구', '남구', '동래구', '기타'],
  '대구': ['수성구', '중구', '달서구', '기타'],
  '인천': ['연수구', '남동구', '부평구', '기타'],
  '광주': ['서구', '북구', '남구', '기타'],
  '대전': ['유성구', '서구', '중구', '기타'],
  // ... 나머지 시도
  '미정/기타': ['미정']
}
```

**저장 필드:**
- `profiles.region_sido` (시·도) — 이미 DB에 있음 ✓
- `profiles.region_sigungu` (시·군·구) — 이미 DB에 있음 ✓

#### 구현 위치
- `app/(auth)/onboarding/page.tsx` — Step 구조 변경, 장소 선택 UI 추가
- 별도 상수 파일: `lib/constants/wedding-locations.ts`

---

## 2. Vendors 탭 완전 재설계

---

### 2-1. 전체 구조 (3-Section Layout)

```
┌─────────────────────────────────────────────┐
│  SECTION A: 카테고리 탐색 (8개)              │
│  [예식장] [스튜디오] [드레스] [메이크업]       │
│  [상견례] [한복] [웨딩밴드] [신혼여행]         │
│  ↓ 클릭 시 업체 검색 모달/페이지로 이동        │
├─────────────────────────────────────────────┤
│  SECTION B: 내가 선택한 업체                  │
│  카테고리별로 선택 완료된 업체 표시             │
│  [예식장: 더케이호텔 ✓] [드레스: 미선택...]    │
├─────────────────────────────────────────────┤
│  SECTION C: AI 추천 업체                     │
│  "내 예산·스타일·위치 기반 AI 추천"           │
│  [추천 예식장 3곳] [추천 스드메 패키지 2곳]   │
└─────────────────────────────────────────────┘
```

---

### 2-2. SECTION A: 카테고리 탐색

#### 카테고리 8개 상세 정의

| # | 카테고리명 | 영문 slug | 네이버 검색 키워드 |
|---|---|---|---|
| 1 | 예식장 | `wedding-hall` | `{시도} 웨딩홀` / `{시도} 예식장` |
| 2 | 스튜디오 | `studio` | `{시도} 웨딩스튜디오` |
| 3 | 드레스 | `dress` | `{시도} 웨딩드레스` |
| 4 | 메이크업 | `makeup` | `{시도} 웨딩메이크업` |
| 5 | 상견례장소 | `meeting-place` | `{시도} 상견례식당` |
| 6 | 한복 | `hanbok` | `{시도} 한복대여` |
| 7 | 웨딩밴드 | `wedding-band` | `{시도} 웨딩밴드` |
| 8 | 신혼여행 | `honeymoon` | `신혼여행 {스타일} 패키지` |

#### 카테고리 클릭 → 업체 탐색 모달 UX

```
┌──────────────────────────────────────────────┐
│  🏛️ 예식장 찾기                    [× 닫기]  │
├──────────────────────────────────────────────┤
│  지역 선택: [서울 ▼] [강남구 ▼]  [🔍 검색]  │
├──────────────────────────────────────────────┤
│  검색 결과 (네이버 지역검색 API)              │
│  ┌────────────────────────────────────────┐  │
│  │ 🏛️ 더케이호텔 서울                    │  │
│  │ ⭐⭐⭐⭐⭐ 4.8  |  리뷰 234개         │  │
│  │ 📍 서울 서초구 남부순환로              │  │
│  │ 💰 가격대: ★★★★☆ (중-고가)         │  │
│  │ 🔗 네이버 플레이스 바로가기           │  │
│  │            [내 업체로 선정하기 ✓]     │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ 🏛️ 롯데호텔 웨딩                      │  │
│  │ ...                                    │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

#### 네이버 검색 API 연동 전략 (DB 과부화 최소화)

```
[사용자 검색 요청]
  ↓
[Next.js Route Handler: /api/vendors/search]
  ├─ 캐시 확인 (Next.js fetch cache, revalidate: 3600s = 1시간)
  │   └─ 캐시 HIT: 캐시 데이터 반환 (DB 조회 없음)
  │   └─ 캐시 MISS: 네이버 API 호출
  │       └─ 결과 반환 + fetch 자동 캐싱
  ↓
[DB 저장은 '사용자가 선택한 업체'만]
  └─ user_vendors 테이블에 선택한 업체 정보만 저장
     (업체 전체 목록은 DB에 저장하지 않음)
```

**캐시 전략:**
- 키: `{category}-{sido}-{sigungu}` (예: `wedding-hall-서울-강남구`)
- TTL: 1시간 (네이버 API revalidate)
- 저장소: Next.js `fetch` cache (서버 메모리) — Redis 불필요

**API Route Handler (`/api/vendors/search`):**
```typescript
// GET /api/vendors/search?category=wedding-hall&sido=서울&sigungu=강남구
// 1. 네이버 지역검색 API 호출 (서버사이드 → API 키 노출 없음)
// 2. 결과 정제 (업체명, 주소, 전화, 링크, 카테고리)
// 3. fetch cache로 자동 캐싱
```

**네이버 API 파라미터:**
- Endpoint: `https://openapi.naver.com/v1/search/local.json`
- Headers: `X-Naver-Client-Id`, `X-Naver-Client-Secret`
- Query: `query={키워드}&display=10&sort=comment`
- 반환: title, address, roadAddress, telephone, link, category, description

---

### 2-3. SECTION B: 내가 선택한 업체

#### DB 스키마 — `user_vendors` 테이블 (신규)

```sql
CREATE TABLE user_vendors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid REFERENCES wedding_groups(id) ON DELETE CASCADE,
  category    text NOT NULL,  -- 'wedding-hall' | 'studio' | ...
  vendor_name text NOT NULL,
  vendor_address text,
  vendor_phone text,
  vendor_link text,
  vendor_rating numeric(2,1),
  price_range text,           -- '저가' | '중가' | '고가'
  memo        text,           -- 사용자 메모
  is_confirmed boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- RLS: 같은 wedding_group 멤버만 접근
ALTER TABLE user_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_access" ON user_vendors
  USING (group_id IN (
    SELECT wedding_group_id FROM profiles WHERE id = auth.uid()
  ));
```

#### UI — 내가 선택한 업체 섹션

```
┌─────────────────────────────────────────────────────────────┐
│  💍 내가 선택한 업체                             8개 중 3개 완료 │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 예식장 ✓    │ 스튜디오 ✓  │ 드레스 ✓    │ 메이크업 ○   │
│ 더케이호텔  │ 스냅스튜디오│ 웨딩드림    │ [선택하기]   │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 상견례 ○   │ 한복 ○      │ 웨딩밴드 ○ │ 신혼여행 ○  │
│ [선택하기]  │ [선택하기]  │ [선택하기]  │ [선택하기]  │
└──────────────┴──────────────┴──────────────┴───────────────┘

[업체 선택 완료된 카드 클릭 시]
→ 상세 보기 모달 (업체 정보 + 메모 + 확정 여부 + 삭제)
```

---

### 2-4. SECTION C: AI 추천 업체

#### 추천 로직

```
Input (온보딩/설정에서 수집한 정보):
  - 결혼 장소: profiles.region_sido + region_sigungu
  - 예산: wedding_groups.total_budget
  - 스타일: profiles.style
  - 결혼 예정일: profiles.wedding_date

Process (Claude API 호출):
  - actions/ai.ts의 recommendVendors() 함수 (신규 추가)
  - 프롬프트: "서울 강남구, 예산 5000만원, 가든웨딩 스타일 커플에게
                웨딩홀 3곳을 추천해줘. 각 업체명, 추천 이유 2줄, 가격대를 JSON으로"

Output (ai_vendor_recommendations 테이블에 캐싱):
  - 카테고리별 추천 업체 3개
  - 추천 이유 (2줄)
  - 예상 가격대
```

#### DB 스키마 — `ai_vendor_recommendations` 테이블 (신규)

```sql
CREATE TABLE ai_vendor_recommendations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     uuid REFERENCES wedding_groups(id),
  category     text NOT NULL,
  recommendations jsonb NOT NULL,  -- [{name, reason, price_range, region}]
  generated_at timestamptz DEFAULT now(),
  is_stale     boolean DEFAULT false  -- 조건 변경 시 재생성 필요
);
```

#### AI 추천 카드 UI

```
┌────────────────────────────────────────────────────┐
│  🤖 AI가 추천하는 업체 (서울 강남, 예산 5,000만원)  │
│  내 스타일: 클래식 + 가든                           │
├────────────────────────────────────────────────────┤
│  예식장 추천                                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ 1위. 신라호텔 웨딩                            │ │
│  │ 강남구 | 가격대: ★★★★★ | 클래식&럭셔리    │ │
│  │ "서울 최고급 호텔 웨딩. 정통 클래식 스타일에  │ │
│  │  완벽한 서비스와 뷰를 제공합니다."            │ │
│  │              [네이버에서 보기] [내 업체로 선정]│ │
│  └───────────────────────────────────────────────┘ │
│  ┌──────────┐ ┌──────────┐                         │
│  │ 2위. ... │ │ 3위. ... │                         │
│  └──────────┘ └──────────┘                         │
└────────────────────────────────────────────────────┘
```

---

### 2-5. Vendors 탭 전체 디자인 가이드

**테마: Spring 테마 (다른 탭들과 일관성 유지)**
- 배경: `#FDF2F8` (blush)
- 카드: `bg-cream rounded-2xl shadow-card`

**카테고리 아이콘 배지:**
```
예식장 🏛️  스튜디오 📸  드레스 👗  메이크업 💄
상견례 🍽️  한복 👘    웨딩밴드 🎵  신혼여행 ✈️
```

**레이아웃 구조:**
```
[페이지 헤더]
  "웨딩 업체 관리"  진행률: 3/8 선정 완료

[Section A: 카테고리 그리드 2×4]
  4개 카테고리씩 2줄 / 모바일: 4×2

[Section B: 내가 선택한 업체]
  가로 스크롤 카드 or 그리드
  선택 완료: 핑크 배지 / 미선택: 점선 카드 [+추가]

[Section C: AI 추천]
  탭 형태 (예식장 / 스드메 / 기타)
  각 탭 내 추천 카드 3개
```

**컬러 코딩 (가격대):**
- 저가: `text-green-600 bg-green-50`
- 중가: `text-yellow-600 bg-yellow-50`
- 고가: `text-red-500 bg-red-50`
- 최고가: `text-purple-600 bg-purple-50`

---

## 3. 구현 순서 (Priority)

### Phase 1 — 필수 수정 (이번 스프린트)
| 우선순위 | 작업 | 담당 | 파일 |
|---|---|---|---|
| P0 | 온보딩에 결혼 장소 스텝 추가 | 개발+디자인 | `onboarding/page.tsx` |
| P0 | 온보딩 완료 시 초대코드 자동 생성 | 개발 | `onboarding/page.tsx` + `invite.ts` |
| P0 | Navbar 이름 자동 표시 | 개발+디자인 | `Navbar.tsx` |
| P1 | tasks/budget → group_id 기반 조회 | 개발 | `checklist.ts`, `budget.ts` |
| P1 | 설정 모달에 결혼 장소 표시 | 디자인 | `SettingsModal.tsx` |

### Phase 2 — Vendors 재설계 (다음 스프린트)
| 우선순위 | 작업 | 담당 | 파일 |
|---|---|---|---|
| P0 | 8개 카테고리 UI | 디자인 | `VendorClient.tsx` |
| P0 | 네이버 API Route Handler | 개발 | `/api/vendors/search/route.ts` |
| P0 | 업체 검색 모달 UI | 디자인 | `VendorSearchModal.tsx` (신규) |
| P0 | user_vendors DB 마이그레이션 | 개발 | `supabase/migrations/` |
| P1 | 내가 선택한 업체 섹션 | 개발+디자인 | `VendorClient.tsx` |
| P1 | AI 추천 로직 | 개발 | `actions/ai.ts` + `VendorClient.tsx` |
| P2 | ai_vendor_recommendations DB | 개발 | `supabase/migrations/` |

---

## 4. DB 마이그레이션 명세

### 4-1. `user_vendors` 테이블 신규 생성
```sql
-- 파일: supabase/migrations/20260219_user_vendors.sql
CREATE TABLE user_vendors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid REFERENCES wedding_groups(id) ON DELETE CASCADE,
  category      text NOT NULL,
  vendor_name   text NOT NULL,
  vendor_address text,
  vendor_phone  text,
  vendor_link   text,
  vendor_rating numeric(2,1),
  price_range   text,
  memo          text,
  is_confirmed  boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE user_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_access" ON user_vendors
  USING (group_id IN (
    SELECT wedding_group_id FROM profiles WHERE id = auth.uid()
  ));
```

### 4-2. `ai_vendor_recommendations` 테이블 신규 생성
```sql
-- 파일: supabase/migrations/20260219_ai_recommendations.sql
CREATE TABLE ai_vendor_recommendations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        uuid REFERENCES wedding_groups(id),
  category        text NOT NULL,
  recommendations jsonb NOT NULL,
  generated_at    timestamptz DEFAULT now(),
  is_stale        boolean DEFAULT false
);
ALTER TABLE ai_vendor_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_access" ON ai_vendor_recommendations
  USING (group_id IN (
    SELECT wedding_group_id FROM profiles WHERE id = auth.uid()
  ));
```

### 4-3. `tasks` 테이블 group_id 컬럼 추가
```sql
-- 파일: supabase/migrations/20260219_tasks_group_id.sql
ALTER TABLE tasks ADD COLUMN group_id uuid REFERENCES wedding_groups(id);
-- 기존 데이터 마이그레이션: user_id → group_id 연결
UPDATE tasks t
  SET group_id = p.wedding_group_id
  FROM profiles p
  WHERE t.user_id = p.id AND p.wedding_group_id IS NOT NULL;
```

---

## 5. 환경 변수 추가 필요

```env
# 네이버 지역검색 API
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret

# 기존 유지
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

---

## 6. 리스크 & 고려사항

| 리스크 | 내용 | 대응책 |
|---|---|---|
| 네이버 API 제한 | 일 25,000건 무료 제한 | fetch 캐싱(1시간), 사용량 모니터링 |
| 별점/리뷰 데이터 | 네이버 지역검색 API는 category/description만 제공, 별점 미제공 | 네이버 플레이스 링크 제공으로 대체 |
| AI 추천 비용 | Claude API 호출 비용 | 최초 1회 생성 후 DB 캐싱, 조건 변경 시에만 재생성 |
| group_id 마이그레이션 | 기존 tasks의 group_id NULL | 파트너 연결 전 개인 데이터는 user_id로 fallback 처리 |
| 소셜 로그인 이름 | provider마다 이름 필드명 다름 | user_metadata.name → full_name 저장 트리거 수정 |

---

*이 PRD는 개발부장과 디자인부장이 참고하여 구현합니다. 구현 중 스펙 변경이 필요하면 기획부장에게 먼저 문의해주세요.*
