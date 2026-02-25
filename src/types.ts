//est. strict contracts that all feat(user, booking, item) must follow to catch any inconsistencies
export type User = {
  id: number
  name: string
  phone: string
  role: 'owner' | 'borrower' | 'admin'
}

export type Item = {
  id: number
  ownerId: number
  title: string
  description: string
  available: boolean
}

export type BookingStatus = 'pending' | 'approved' | 'rejected'

export type Booking = {
  id: number
  itemId: number
  borrowerId: number
  status: BookingStatus
}
//these types are the database schema
//every other feature will depend on these contracts
//'src/types.ts' is a global contracts for all the other files to access the structure

