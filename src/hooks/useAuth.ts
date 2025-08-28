import { useAuth0 } from '@auth0/auth0-react'

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0()

  const login = () => {
    loginWithRedirect()
  }

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    })
  }

  // Función para obtener token para APIs
  const getToken = async () => {
    try {
      return await getAccessTokenSilently()
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    // Datos adicionales de Auth0
    email: user?.email,
    name: user?.name,
    picture: user?.picture,
    // Rol personalizado (si lo configuras en Auth0)
    role: user?.['https://medialab.com/roles']?.[0] || 'user'
  }
}
