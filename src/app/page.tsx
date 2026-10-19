import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/currentUser'
import PageHeader from './components/PageHeader'
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
    <div className="page">
      {/* the lists sit side by side; the item grids below get the full width */}
      <div className="home-top">
        {user.canList && <ActionNeededSection userId={user.id} />}
        <MyBookingsSection userId={user.id} />
      </div>
      {user.canList && <MyItemsSection userId={user.id} />}
      <AvailableItemsSection userId={user.id} />
    </div>
  )
}
