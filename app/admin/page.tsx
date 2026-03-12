import { getAllPostsAdmin, getAllMembers, getAllPlacesForAdmin, getAnalyticsData, getUserAnalyticsData } from '@/actions/admin'
import AdminClient from '@/components/admin/AdminClient'

export default async function AdminPage() {
    const [posts, members, places, analytics, userAnalytics] = await Promise.all([
        getAllPostsAdmin(),
        getAllMembers(),
        getAllPlacesForAdmin(),
        getAnalyticsData(),
        getUserAnalyticsData()
    ])

    return (
        <AdminClient
            posts={posts}
            members={members}
            places={places}
            analytics={analytics}
            userAnalytics={userAnalytics}
        />
    )
}
