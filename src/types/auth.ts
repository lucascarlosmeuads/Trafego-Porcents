
import type { User } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }> // NOVO
  isAdmin: boolean
  isGestor: boolean
  isCliente: boolean
  isVendedor: boolean
  isSites: boolean
  currentManagerName: string
}

export type UserType = 'admin' | 'gestor' | 'cliente' | 'vendedor' | 'sites' | 'unauthorized' | 'error'
