//server component to get all the items for listing to reduce the js bundle sent to the browser
import { prisma } from "@/lib/prisma"

export default async function ItemsPage() {
  //Gets all items that are avalable by filtering with bookings' status as "APPROVED", Not available
  const items = await prisma.item.findMany({
    include: {
      bookings: {
        where: { status: 'APPROVED'}
      }
    }
  })
  if(!items || items.length === 0) {
    return <div>No available items to book</div>
  }
  

// '.map' function is used to transform your data (an array of item objects into UI an array of react elements.)

  return(
    <div>
      <h1>Available items</h1>
      <ul>
        {items.map(item => {
          const isAvailable = item.bookings.length === 0

          return(
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              { isAvailable ?
              (<button>Request booking</button>) : (<p>Unavailable</p>)
              }
            </li>
          )
        })} 
      </ul>
    </div>
  )
}






