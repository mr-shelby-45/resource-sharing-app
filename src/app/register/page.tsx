import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import RegistrationForm from './RegisterForm'
import { registerUser } from '@/services/authServices'
import { signToken } from '@/lib/auth'
import { validateRegisterInput, validatePasswordsMatch } from '@/lib/validators'
import { userMessage } from '@/lib/errors'
import type { FormState } from '@/lib/formState'

async function register(_prevState: FormState, formData: FormData): Promise<FormState> {
  'use server'
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const phone = String(formData.get('phone') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  try {
    validateRegisterInput(name, email, phone, password)
    // the browser checks this too, but the server must not trust the browser
    validatePasswordsMatch(password, confirmPassword)
    const user = await registerUser(name, email, phone, password)
    const cookiesStore = await cookies()
    cookiesStore.set('token', signToken(user.id), {
      httpOnly: true,
      path: '/',
      maxAge: 604800,
      sameSite: 'strict',
    })
  } catch (error) {
    // refill everything except the passwords
    return { error: userMessage(error, 'Registration failed'), values: { name, email, phone } }
  }
  redirect('/')
}

export default function RegistrationPage() {
  return (
    <div className="page">
      <RegistrationForm action={register} />
    </div>
  )
}
