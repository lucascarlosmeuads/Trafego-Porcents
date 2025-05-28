
import { useState } from 'react'
import { MainLoginForm } from './LoginForm/MainLoginForm'
import { PasswordResetForm } from './LoginForm/PasswordResetForm'

export function LoginForm() {
  const [isPasswordReset, setIsPasswordReset] = useState(false)

  const handleShowPasswordReset = () => {
    setIsPasswordReset(true)
  }

  const handleBackToLogin = () => {
    setIsPasswordReset(false)
  }

  if (isPasswordReset) {
    return <PasswordResetForm onBackToLogin={handleBackToLogin} />
  }

  return <MainLoginForm onForgotPassword={handleShowPasswordReset} />
}
