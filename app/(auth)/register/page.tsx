import { redirect } from 'next/navigation'

// Registration is not available in this system.
// Public users do not have accounts.
export default function RegisterPage() {
  redirect('/')
}
