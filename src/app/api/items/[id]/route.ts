//get item by id and delete it.
import { deleteItem } from "@/services/itemServices"
import { withAuth } from "@/lib/apiHandler"

//request incoming http request including body,headers,cookies ({ request: Request})->( {parameter} : { type annotation })
//({params} : { params: Promise<{ id: string} >}), context parameter ({ (params)destructured directly } : { type annotation : Promise that resolves to an object hence has to be converted "number(id)"})

export async function DELETE(request: Request, { params } : { params: Promise<{ id : string }>}) {
  return withAuth(request, async(_req, currentUser) => {
    const { id } = await params
    const deletedItem = await deleteItem(Number(id), currentUser)
    return Response.json(deletedItem, { status: 200 })
  })
}

/**
 try {
  const auth = requireAuth(request)
  //get the userId from the cookie
  if('error' in auth) {
    return Response.json(
      { message: auth.error },
      { status: auth.status}
    )
  }
  //get the user from db by filtering with userId from cookie
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId }
  })
  if(!currentUser) {
    return Response.json(
      {message: "user not found"},
      { status: 404 }
    )
  }
  //get the id of the item to be deleted from the URL
  const { id } = await params
  const itemId = Number(id)
  //call the function delete item from the database
  const deletedItem = await deleteItem(itemId, currentUser)
  //returns the deletedItem with status 200 ,success
  return Response.json(deletedItem, {status: 200})
} catch(error: any){
  
  console.error("Delete error:", error)
  return Response.json(
    { message: error.message || "An unexpected error occurred"},
    { status: 500 }
  )
}
 */