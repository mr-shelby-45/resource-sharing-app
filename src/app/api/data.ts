//simulated db where i will import from when writing the code for the api routes
import { User, Item, Booking } from '@/generated/prisma/client'

export let users : User[] = [
  { id: 1, name: 'Alice', phone: '0712345678', email: 'alice@gmail.com', role: 'OWNER'},
  { id: 2, name: 'Mac', phone: '0798765432', email: 'mac@gmail.com', role: 'BORROWER'}
]

export let items: Item[] = [
  {
  id: 1,
  ownerId: 1,
  title: 'Electric drill',
  description: 'Good condition, light use',
  available: true
 }
]

export let bookings: Booking[] = []