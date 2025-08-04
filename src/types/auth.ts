
import type { User } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isGestor: boolean
  isCliente: boolean
  isVendedor: boolean
  isSites: boolean
  isRelatorios: boolean
  isClienteNovo: boolean // NOVO
  isClienteParceria: boolean // NOVO - Cliente de Parceria
  currentManagerName: string
}

export type UserType = 'admin' | 'gestor' | 'cliente' | 'vendedor' | 'sites' | 'relatorios' | 'clientenovo' | 'clienteparceria' | 'unauthorized' | 'error' // ATUALIZADO
