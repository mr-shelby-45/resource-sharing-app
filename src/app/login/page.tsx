// server component: the login action runs on the server, the form is a client component
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LoginForm from './Loginform'
import { loginUser } from '@/services/authServices'
import { signToken } from '@/lib/auth'
import { validateLoginInput } from '@/lib/validators'
import { userMessage } from '@/lib/errors'
import type { FormState } from '@/lib/formState'

async function login(_prevState: FormState, formData: FormData): Promise<FormState> {
  'use server'
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  try {
    validateLoginInput(email, password)
    const user = await loginUser(email, password)
    const cookiesStore = await cookies()
    cookiesStore.set('token', signToken(user.id), {
      httpOnly: true,
      path: '/',
      maxAge: 604800,
      sameSite: 'strict',
    })
  } catch (error) {
    // keep the email so it is still there after a wrong password
    return { error: userMessage(error, 'Log in failed'), values: { email } }
  }
  // redirect throws, so it must stay outside the try
  redirect('/')
}

export default function LoginPage() {
  return (
    <div className="page">
      <LoginForm action={login} />
    </div>
  )
}
