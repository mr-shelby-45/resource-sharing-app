// page.tsx - server component
import { redirect } from "next/navigation"
import { cookies } from 'next/headers'
import LoginForm from "./Loginform"
import { loginUser } from "@/services/authServices"
import { signToken } from "@/lib/auth"

async function login(prevState: any,formData: FormData) {
  'use server'
  try {
    //.get takes in the data entered
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    //retrieve user by their email
    if(!email || !password) {
      return { error: "Email and Password required"}
    }
    const user = await loginUser(email, password)
    const signedToken = signToken(user.id, user.role)
    const cookiesStore = await cookies()
    cookiesStore.set('token', signedToken, {
      httpOnly: true,
      path: '/',
      maxAge: 604800,
      sameSite: 'strict'
    })
    redirect('/')
  } catch(error) {
    return { error: error instanceof Error ? error.message : 'Log in failed' }
  }
}
//Server Actions in Next.js have a specific contract: they either return nothing or return serializable data, but they cannot return Response objects.
//exports to the client component
export default function loginPage() {
  return (
    <div className="page">
      <h1 style={{
        marginBottom: '8px'
      }}>Jirani</h1>
      <p style={{ 
        color: 'var(--text-muted)',
        marginBottom: '24px', 
        fontSize: '0.95rem' 
        }}>
          Community resource sharing platform
        </p>
      <hr style={{ 
        border: 'none', 
        borderTop: '1px solid var(--border)', 
        marginBottom: '32px' 
      }} />
      <LoginForm action={login}/>
    </div>
  )
}