//get item by id and delete it.
import { deleteItem } from "@/services/itemServices"
import { withAuth } from "@/lib/apiHandler"
import { AppError } from "@/lib/errors"

//request incoming http request including body,headers,cookies ({ request: Request})->( {parameter} : { type annotation })
//({params} : { params: Promise<{ id: string} >}), context parameter ({ (params)destructured directly } : { type annotation : Promise that resolves to an object hence has to be converted "number(id)"})

export async function DELETE(request: Request, { params } : { params: Promise<{ id : string }>}) {
  return withAuth(request, async(_req, currentUser) => {
    const { id } = await params
    const itemId = Number(id)
    if(!Number.isInteger(itemId)) {
      throw new AppError(400, "Item id must be a whole number")
    }
    const deletedItem = await deleteItem(Number(id), currentUser)
    return Response.json(deletedItem, { status: 200 })
  })
}
