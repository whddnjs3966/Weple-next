-- =====================================================
-- Migration: 초대 코드 시스템 및 웨딩 그룹 테이블
-- Date: 2026-02-15
-- Description:
--   1. wedding_groups 테이블 생성 (커플 단위 데이터 공유)
--   2. profiles 테이블에 invite_code, wedding_group_id 컬럼 추가
--   3. RLS 정책 설정
-- =====================================================

-- ─── Step 1. wedding_groups 테이블 생성 ───
create table if not exists public.wedding_groups (
  id uuid default gen_random_uuid() primary key,
  groom_name text,
  bride_name text,
  wedding_date date,
  total_budget bigint default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.wedding_groups enable row level security;

-- ─── Step 2. profiles 테이블에 컬럼 추가 (RLS 정책보다 먼저!) ───

-- 초대 코드 (8자리, 유니크)
alter table public.profiles
  add column if not exists invite_code text unique;

-- 웨딩 그룹 연결 (FK)
alter table public.profiles
  add column if not exists wedding_group_id uuid references public.wedding_groups(id) on delete set null;

-- 인덱스 생성 (검색 성능 최적화)
create index if not exists idx_profiles_invite_code
  on public.profiles (invite_code)
  where invite_code is not null;

create index if not exists idx_profiles_wedding_group_id
  on public.profiles (wedding_group_id)
  where wedding_group_id is not null;

-- ─── Step 3. wedding_groups RLS 정책 (profiles.wedding_group_id 존재 후) ───

-- 정책: 같은 그룹 멤버만 조회 가능
create policy "Group members can view their group."
  on wedding_groups for select
  using (
    id in (
      select wedding_group_id from public.profiles
      where id = auth.uid()
    )
  );

-- 정책: 인증된 사용자만 그룹 생성 가능
create policy "Authenticated users can create groups."
  on wedding_groups for insert
  with check ( auth.uid() is not null );

-- 정책: 같은 그룹 멤버만 수정 가능
create policy "Group members can update their group."
  on wedding_groups for update
  using (
    id in (
      select wedding_group_id from public.profiles
      where id = auth.uid()
    )
  );
