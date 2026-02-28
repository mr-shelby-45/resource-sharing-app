//this is the UI  for the items listing
//all items will be listed here

'use client'

import { useEffect, useState } from "react"
import { Item } from '@/generated/prisma/client'

export default function ItemsPage() {
  const[items, setItems] = useState<Item[]>([])
  //fetch items on mount
  //useEffect has to be inside the component function to access setItems
useEffect(() => {
  fetch('/api/items')
    .then(res => res.json())
    .then((data: Item[]) => setItems(data))
}, []) // render only once on mount
// '.map' function is used to transform your data (an array of item objects into UI an array of react elements.)

return(
  <div>
    <h1>Available items</h1>
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
          { item.available ?
          (<button>Request booking</button>) : (<p>Unavailable</p>)
          }
          {/*
          { item.available ?
          (<p style={{ color: 'green' }}>Available</p>) : (<p style={{ color: 'red' }}>Unavailable</p>)
          }
          {item.available && 
          (<button style={{backgroundColor: 'lightgreen'}}>Request booking</button>)
          }
          */}
        </li>
      ))} 
    </ul>
  </div>
)
}






