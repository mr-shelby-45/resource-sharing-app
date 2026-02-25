//simulated db where i will import from when writing the code for the api routes
import { User, Item, Booking } from '@/types'

export let users : User[] = [
  { id: 1, name: 'Alice', phone: '0712345678', role: 'owner'},
  { id: 2, name: 'Mac', phone: '0798765432', role: 'borrower'}
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