import { useAuth } from '../hooks/useAuth'

export const UserMenu = () => {
  const { user, logout, name, email, picture, role } = useAuth()

  if (!user) return null

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 text-zinc-200 hover:text-white transition-colors">
        {picture ? (
          <img 
            src={picture} 
            alt={name || 'Usuario'} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-zinc-400 capitalize">{role}</p>
        </div>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-64 bg-zinc-800 rounded-md shadow-lg border border-zinc-700 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-2">
          <div className="px-4 py-3 border-b border-zinc-700">
            <p className="font-medium text-zinc-200">{name}</p>
            <p className="text-sm text-zinc-400">{email}</p>
            <p className="text-xs text-zinc-500 mt-1 capitalize">Rol: {role}</p>
          </div>
          
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
