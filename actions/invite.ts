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

    // 현재 유저의 프로필 확인 (기존 그룹 소속 여부)
    const { data: myProfile } = await supabase
        .from('profiles')
        .select('wedding_group_id')
        .eq('id', user.id)
        .single()

    // 이미 그룹에 속한 유저가 다른 그룹에 참여 시 차단
    if (myProfile?.wedding_group_id) {
        return { error: '이미 파트너와 연결되어 있습니다. 기존 연결을 해제한 후 다시 시도해주세요.' }
    }

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

    // 2. 초대자의 wedding_group_id가 있으면 그룹 인원 확인 후 연결
    if (inviter.wedding_group_id) {
        // 그룹 최대 인원 2명 제한
        const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('wedding_group_id', inviter.wedding_group_id)

        if (count && count >= 2) {
            return { error: '해당 그룹은 이미 최대 인원(2명)에 도달했습니다.' }
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ wedding_group_id: inviter.wedding_group_id })
            .eq('id', user.id)

        if (updateError) return { error: updateError.message }

        revalidatePath('/dashboard')
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

    revalidatePath('/dashboard')
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

    // 이름 마스킹 (예: "김민수" → "김*수", "이아름" → "이*름")
    const rawName = inviter.full_name || '파트너'
    const maskedName = rawName.length >= 2
        ? rawName[0] + '*'.repeat(rawName.length - 2) + rawName[rawName.length - 1]
        : rawName

    return {
        valid: true,
        inviterName: maskedName,
        message: `${maskedName}님의 초대 코드입니다.`,
    }
}
