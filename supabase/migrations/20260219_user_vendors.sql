-- user_vendors: 커플이 선택한 업체 저장 테이블
-- Supabase Dashboard > SQL Editor에서 실행해주세요.

CREATE TABLE IF NOT EXISTS user_vendors (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        uuid REFERENCES wedding_groups(id) ON DELETE CASCADE,
    user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    category        text NOT NULL,           -- 'wedding-hall' | 'studio' | 'dress' | ...
    vendor_name     text NOT NULL,
    vendor_address  text,
    vendor_phone    text,
    vendor_link     text,
    price_range     text,                    -- '저가' | '중가' | '고가'
    memo            text,
    is_confirmed    boolean DEFAULT false,
    created_at      timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE user_vendors ENABLE ROW LEVEL SECURITY;

-- 같은 wedding_group 멤버 또는 본인만 조회
CREATE POLICY "user_vendors_select" ON user_vendors
    FOR SELECT USING (
        group_id IN (
            SELECT wedding_group_id FROM profiles WHERE id = auth.uid()
        )
        OR user_id = auth.uid()
    );

-- 본인만 삽입
CREATE POLICY "user_vendors_insert" ON user_vendors
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 본인만 수정
CREATE POLICY "user_vendors_update" ON user_vendors
    FOR UPDATE USING (user_id = auth.uid());

-- 본인만 삭제
CREATE POLICY "user_vendors_delete" ON user_vendors
    FOR DELETE USING (user_id = auth.uid());
