//this is the authorization infrastructure that will be swapped out for middleware 
//this will run first before the api routes, extract identity from the header(that's from the browser)
//evaluate that identity if it exists, either return an authenticated user or an error message

type AuthSuccess = {
  userId: number
}
//this is the contract that the error code should follow
type AuthFailure = {
  error: string
  status: number
}
export function requireAuth(
  request: Request
): AuthSuccess | AuthFailure {
  const userId = request.headers.get('x-user-id')

  if(!userId) {
    return { error: 'Unauthorized', status: 401 }
  }

  return { userId: Number(userId) }
}


