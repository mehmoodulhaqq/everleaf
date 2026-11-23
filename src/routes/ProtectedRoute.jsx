import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { ROUTES } from './routeConfig'

function ProtectedRoute() {
  const { user, loading, authError } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-background px-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-caramel" />
          <p className="text-sm text-text-secondary">
            Checking your account...
          </p>
        </div>
      </main>
    )
  }

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div
          className="max-w-md text-center"
          role="alert"
          aria-live="assertive"
        >
          <h1 className="font-display text-xl font-semibold text-text-primary">
            We couldn't verify your account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Please refresh the page and try again. If the problem continues,
            check your internet connection and sign in again.
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location }}
      />
    )
  }

  // Email/password accounts must verify their email before using private
  // application pages. Google accounts normally arrive with emailVerified=true.
  if (!user.emailVerified) {
    return <Navigate to={ROUTES.VERIFY_EMAIL} replace />
  }

  return <Outlet />
}

export default ProtectedRoute