import { useAuth } from '../hooks/useAuth'
import { LoginButton } from './LoginButton'

interface Props {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { isAuthenticated, isLoading, role } = useAuth()

  // Mostrar loading mientras Auth0 verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-zinc-400">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginButton />
  }

  // Verificar roles si se especifican
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center text-zinc-400">
          <h2 className="text-xl mb-2">Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta página</p>
          <p className="text-sm mt-2">Rol actual: {role}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
