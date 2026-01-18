import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { userService, User } from '../services/dataService'

type AuthContextValue = {
  user: User | null
  login: (email?: string, password?: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => {},
  logout: () => {},
  setUser: () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    userService.getCurrentUser().then(setUser).catch(() => setUser(null))
  }, [])

  const login = async () => {
    const current = await userService.getCurrentUser()
    setUser(current)
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
