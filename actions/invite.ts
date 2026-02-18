'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

// 초대 코드 생성 헬퍼 (8자리 영숫자)
function generateCode(length = 8): string {
    return crypto.randomBytes(length).toString('base64url').slice(0, length).toUpperCase()
}

/**
 * 초대 코드 생성
 * - 현재 로그인한 유저의 고유 초대 코드를 생성하여 profiles에 저장
 * - 이미 코드가 존재하면 기존 코드를 반환
 */
export async function generateInviteCode() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 기존 초대 코드가 있는지 확인
    const { data: profile } = await supabase
        .from('profiles')
        .select('invite_code')
        .eq('id', user.id)
        .single()

    if (profile?.invite_code) {
        return { code: profile.invite_code }
    }

    // 새로운 초대 코드 생성 (8자리)
    const inviteCode = generateCode(8)

    const { error } = await supabase
        .from('profiles')
        .update({ invite_code: inviteCode })
        .eq('id', user.id)

    if (error) return { error: error.message }

    return { code: inviteCode }
}

/**
 * 초대 코드로 파트너 연결 (데이터 동기화)
 * - 입력받은 초대 코드의 소유자를 찾아 같은 wedding_group으로 연결
 * - 두 유저의 데이터(체크리스트, 일정 등)가 공유됨
 */
export async function joinByInviteCode(inviteCode: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }
    if (!inviteCode || inviteCode.trim().length === 0) {
        return { error: '초대 코드를 입력해 주세요.' }
    }

    const code = inviteCode.trim().toUpperCase()

    // 1. 초대 코드 소유자 찾기
    const { data: inviter, error: findError } = await supabase
        .from('profiles')
        .select('id, wedding_group_id')
        .eq('invite_code', code)
        .single()

    if (findError || !inviter) {
        return { error: '유효하지 않은 초대 코드입니다.' }
    }

    // 자기 자신의 코드인지 확인
    if (inviter.id === user.id) {
        return { error: '본인의 초대 코드는 사용할 수 없습니다.' }
    }

    // 2. 초대자의 wedding_group_id가 있으면 같은 그룹으로 연결
    if (inviter.wedding_group_id) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ wedding_group_id: inviter.wedding_group_id })
            .eq('id', user.id)

        if (updateError) return { error: updateError.message }

        revalidatePath('/', 'layout')
        return { success: true, message: '파트너와 연결되었습니다!' }
    }

    // 3. 초대자에게 그룹이 없으면 새 그룹 생성 후 양쪽 연결
    const { data: newGroup, error: groupError } = await supabase
        .from('wedding_groups')
        .insert({})
        .select('id')
        .single()

    if (groupError || !newGroup) {
        return { error: '그룹 생성에 실패했습니다.' }
    }

    // 양쪽 모두 같은 그룹으로 설정
    const { error: linkError } = await supabase
        .from('profiles')
        .update({ wedding_group_id: newGroup.id })
        .in('id', [user.id, inviter.id])

    if (linkError) return { error: linkError.message }

    revalidatePath('/', 'layout')
    return { success: true, message: '파트너와 연결되었습니다!' }
}

/**
 * 초대 코드 유효성 검증 (미리보기용)
 * - 코드 입력 시 실시간으로 유효한 코드인지 확인
 */
export async function validateInviteCode(inviteCode: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const code = inviteCode.trim().toUpperCase()

    const { data: inviter } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('invite_code', code)
        .single()

    if (!inviter) {
        return { valid: false, message: '유효하지 않은 초대 코드입니다.' }
    }

    if (inviter.id === user.id) {
        return { valid: false, message: '본인의 초대 코드입니다.' }
    }

    return {
        valid: true,
        inviterName: inviter.full_name || '파트너',
        message: `${inviter.full_name || '파트너'}님의 초대 코드입니다.`,
    }
}
