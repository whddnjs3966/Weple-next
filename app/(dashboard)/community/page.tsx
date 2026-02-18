import CommunityClient from "@/components/community/CommunityClient";
import { getPosts, type Post } from "@/actions/community";

export default async function CommunityPage() {
    // 초기 데이터 로드 (전체 보기)
    const { posts, count } = await getPosts('all');

    // 타입 캐스팅 (액션에서 반환하는 타입과 클라이언트 props 타입 호환)
    const initialPosts = posts as any; // CommunityClient 내부 타입과 맞추기 위해

    return <CommunityClient initialPosts={initialPosts} initialCount={count} />
}
