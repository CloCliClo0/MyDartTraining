import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

interface Props {
  children: ReactNode
}

/** Redirige vers /login si l'utilisateur n'est pas authentifié. */
function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
