import { getAllPostsAdmin, getAllMembers, getAllPlacesForAdmin, getAnalyticsData } from '@/actions/admin'
import AdminClient from '@/components/admin/AdminClient'

export default async function AdminPage() {
    const [posts, members, places, analytics] = await Promise.all([
        getAllPostsAdmin(),
        getAllMembers(),
        getAllPlacesForAdmin(),
        getAnalyticsData()
    ])

    return (
        <AdminClient
            posts={posts}
            members={members}
            places={places}
            analytics={analytics}
        />
    )
}
