import { items } from '../data'

//GET all items 
export async function GET() {
  return Response.json(items)
}