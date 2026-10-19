import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/currentUser'
import PageHeader from './components/PageHeader'
import HomeFinder from './components/HomeFinder'
import MyItemsSection from './components/dashboard/MyItemsSection'
import ActionNeededSection from './components/dashboard/ActionNeededSection'
import MyBookingsSection from './components/dashboard/MyBookingsSection'
import AvailableItemsSection from './components/dashboard/AvailableItemsSection'

// The dashboard only decides who you are and which sections you see.
// Each section loads its own data, and a failure falls through to error.tsx.
export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  if (!user.canBorrow && !user.canList) {
    return (
      <div className="page">
        <PageHeader title={`Hey, ${user.name}`} subtitle="You have been banned from this website. Contact admin." />
      </div>
    )
  }

  return (
    <div className="page home-page">
      <HomeFinder name={user.name} />
      {user.canList && <ActionNeededSection userId={user.id} />}
      {user.canList && <MyItemsSection userId={user.id} />}
      <MyBookingsSection user={user} />
      <AvailableItemsSection userId={user.id} />
    </div>
  )
}
