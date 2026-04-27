import { Navigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
    if (user.role === 'ORGANIZER') return <Navigate to="/organizer" replace />
    return <Navigate to="/" replace />
  }

  return children
}
