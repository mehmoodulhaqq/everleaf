
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Leaf,
  Mail,
} from 'lucide-react'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { requestPasswordReset } from '../../services/authService'

function getResetErrorMessage(error) {
  const messages = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled':
      'This account cannot currently receive a password reset. Please contact support.',
    'auth/too-many-requests':
      'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection and try again.',
    'auth/operation-not-allowed':
      'Password reset is not enabled in Firebase. Please contact support.',
  }

  return (
    messages[error?.code] ||
    'We could not send the reset email. Please try again.'
  )
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccessful, setIsSuccessful] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSuccessful(false)

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setErrorMessage('Please enter your email address.')
      return
    }

    setIsSubmitting(true)

    try {
      await requestPasswordReset(normalizedEmail)
      setIsSuccessful(true)
    } catch (error) {
      console.error('Password reset request error:', error)
      setErrorMessage(getResetErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/explore"
            className="mb-5 inline-flex items-center gap-2"
            aria-label="Everleaf home"
          >
            <Leaf className="h-8 w-8 text-caramel" />
            <span className="font-display text-3xl font-semibold tracking-tight text-espresso">
              everleaf
            </span>
          </Link>

          <p className="text-sm text-text-secondary">
            A little growth with every page.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          {isSuccessful ? (
            <div className="py-5 text-center" aria-live="polite">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>

              <h1 className="font-display text-2xl font-semibold text-text-primary">
                Check your inbox
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                If an account is associated with this email address, a
                password reset link will be sent to:
              </p>

              <p className="mt-3 break-all font-semibold text-text-primary">
                {email.trim().toLowerCase()}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Follow the instructions in the email. If it does not arrive,
                check your spam folder.
              </p>

              <div className="mt-7">
                <Link to="/login">
                  <Button fullWidth>
                    Back to sign in
                  </Button>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessful(false)
                  setEmail('')
                  setErrorMessage('')
                }}
                className="mt-4 text-sm font-medium text-walnut transition hover:text-primary-hover"
              >
                Try another email
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary">
                  <BookOpen className="h-6 w-6 text-walnut" />
                </div>

                <h1 className="font-display text-2xl font-semibold text-text-primary">
                  Forgot your password?
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Enter the email address associated with your account and
                  we'll help you reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  leadingIcon={<Mail className="h-4 w-4" />}
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                />

                {errorMessage && (
                  <div
                    role="alert"
                    className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
                  >
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                >
                  Send reset link
                </Button>
              </form>

              <div className="my-6 border-t border-border" />

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-walnut transition hover:text-primary-hover"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-text-muted">
          Your reading journey, thoughtfully organized.
        </p>
      </div>
    </main>
  )
}

export default ForgotPassword
