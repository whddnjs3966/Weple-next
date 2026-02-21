import { getAllPostsAdmin, getAllMembers, getAllPlacesForAdmin } from '@/actions/admin'
import AdminClient from '@/components/admin/AdminClient'

export default async function AdminPage() {
    const [posts, members, places] = await Promise.all([
        getAllPostsAdmin(),
        getAllMembers(),
        getAllPlacesForAdmin(),
    ])

    return (
        <AdminClient
            posts={posts}
            members={members}
            places={places}
        />
    )
}
