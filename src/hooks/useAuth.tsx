
import { createContext, useContext } from 'react'
import { useAuthState } from '@/hooks/useAuthState'
import { useAuthActions } from '@/hooks/useAuthActions'
import { useAuthListener } from '@/hooks/useAuthListener'
import type { AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    loading,
    isAdmin,
    isGestor,
    isCliente,
    isVendedor,
    isSites,
    currentManagerName
  } = useAuthState()

  const { signIn, signUp, signOut } = useAuthActions()
  
  // Set up auth state listener
  useAuthListener()

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      isAdmin, 
      isGestor,
      isCliente,
      isVendedor,
      isSites,
      currentManagerName
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
