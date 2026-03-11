import { Metadata } from "next";
import CommunityClient from "@/components/community/CommunityClient";
import { getPosts, type Post } from "@/actions/community";

export const metadata: Metadata = {
    title: '커뮤니티 - 결혼 준비 이야기',
    description: '예비 신랑신부들의 결혼 준비 이야기를 나누세요. 웨딩 팁, 후기, 질문을 자유롭게 공유합니다.',
}

export default async function CommunityPage() {
    // 초기 데이터 로드 (전체 보기)
    const { posts, count } = await getPosts('all');

    // 타입 캐스팅 (액션에서 반환하는 타입과 클라이언트 props 타입 호환)
    const initialPosts = posts as any; // CommunityClient 내부 타입과 맞추기 위해

    return <CommunityClient initialPosts={initialPosts} initialCount={count} />
}
