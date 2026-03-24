import { redirect } from "next/navigation"
import RegistrationForm from "./RegisterForm"
import { registerUser } from "@/services/authServices"
import { signToken } from "@/lib/auth"
import { cookies } from "next/headers"

async function register(prevState: any, formData: FormData) {
  'use server'
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const role = formData.get('role')  as 'OWNER' | 'BORROWER'
    if(!name ||!email || !phone || !password || !role) {
    return { error: "All fields are required!"}
    }
    const user = await registerUser(name, email, phone, password, role)
    const signedToken = signToken(user.id, user.role)
    const cookiesStore = await cookies()
    cookiesStore.set('token', signedToken, {
      httpOnly: true,
      path: '/',
      maxAge: 604800,
      sameSite: 'strict'
    })
  } catch(error) {
    return { error: error instanceof Error ? error.message: 'Registration failed' }
  }
  //on successful reg redirect to the homepage
  redirect('/')
}
//<!--react elements have to be uppercase -->
export default function registrationPage() {
  return (
    <div className="page">
      <h1 style={{ marginBottom: '8px' }}>Jirani</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
        Community resource sharing platform
      </p>
      <hr style={{ 
        border: 'none', 
        borderTop: '1px solid var(--border)', 
        marginBottom: '32px' 
      }} />
      <RegistrationForm action={register} />
    </div>
  )
}
