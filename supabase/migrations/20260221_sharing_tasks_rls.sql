-- =====================================================
-- Migration: Tasks and User Places Sharing RLS Fix
-- Date: 2026-02-21
-- Description:
--   Update RLS policies on tasks and user_places to ensure
--   couples in the same wedding group share full CRUD permissions.
-- =====================================================

-- 1. FIX TASKS RLS
DROP POLICY IF EXISTS "Users can manage their own tasks." ON public.tasks;

CREATE POLICY "Users can manage tasks in their wedding group"
ON public.tasks
FOR ALL
USING (
  user_id = auth.uid() OR
  user_id IN (
    SELECT id FROM public.profiles
    WHERE wedding_group_id = (
      SELECT wedding_group_id FROM public.profiles WHERE id = auth.uid()
    )
    AND wedding_group_id IS NOT NULL
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  user_id IN (
    SELECT id FROM public.profiles
    WHERE wedding_group_id = (
      SELECT wedding_group_id FROM public.profiles WHERE id = auth.uid()
    )
    AND wedding_group_id IS NOT NULL
  )
);

-- 2. FIX USER_PLACES (VENDORS) RLS
DROP POLICY IF EXISTS "user_vendors_insert" ON public.user_places;
DROP POLICY IF EXISTS "user_vendors_update" ON public.user_places;
DROP POLICY IF EXISTS "user_vendors_delete" ON public.user_places;

CREATE POLICY "Group members can insert user_places"
ON public.user_places FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  group_id = (SELECT wedding_group_id FROM profiles WHERE id = auth.uid() AND wedding_group_id IS NOT NULL)
);

CREATE POLICY "Group members can update user_places"
ON public.user_places FOR UPDATE
USING (
  user_id = auth.uid() OR
  group_id = (SELECT wedding_group_id FROM profiles WHERE id = auth.uid() AND wedding_group_id IS NOT NULL)
);

CREATE POLICY "Group members can delete user_places"
ON public.user_places FOR DELETE
USING (
  user_id = auth.uid() OR
  group_id = (SELECT wedding_group_id FROM profiles WHERE id = auth.uid() AND wedding_group_id IS NOT NULL)
);
