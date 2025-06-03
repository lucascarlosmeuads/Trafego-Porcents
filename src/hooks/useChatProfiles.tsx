
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface GestorProfile {
  email: string
  nome_gestor: string
  avatar_url?: string | null
}

interface ClienteProfile {
  email: string
  nome: string
  avatar_url?: string | null
}

interface UseChatProfilesReturn {
  gestorProfiles: GestorProfile[]
  loading: boolean
  error: string | null
}

interface UseChatProfilesDetailReturn {
  gestorProfile: any
  clienteProfile: any
  loading: boolean
}

// Hook para buscar todos os perfis de gestores (sem parâmetros)
export function useChatProfiles(): UseChatProfilesReturn

// Hook para buscar perfis específicos de cliente e gestor (com parâmetros)
export function useChatProfiles(emailCliente: string, emailGestor: string): UseChatProfilesDetailReturn

// Implementação do hook
export function useChatProfiles(emailCliente?: string, emailGestor?: string) {
  const [gestorProfiles, setGestorProfiles] = useState<GestorProfile[]>([])
  const [gestorProfile, setGestorProfile] = useState<any>(null)
  const [clienteProfile, setClienteProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Se não foram passados parâmetros, buscar todos os gestores
        if (!emailCliente && !emailGestor) {
          const { data, error } = await supabase
            .from('gestores')
            .select('email, nome, avatar_url')
            .eq('ativo', true)

          if (error) throw error

          const profiles = data?.map(gestor => ({
            email: gestor.email,
            nome_gestor: gestor.nome,
            avatar_url: gestor.avatar_url
          })) || []

          setGestorProfiles(profiles)
        } else {
          // Buscar perfis específicos
          if (!emailCliente || !emailGestor) {
            setLoading(false)
            return
          }

          // Buscar dados do gestor
          const { data: gestorData } = await supabase
            .from('gestores')
            .select('email, nome, avatar_url')
            .eq('email', emailGestor)
            .maybeSingle()

          if (gestorData) {
            setGestorProfile({
              email: gestorData.email,
              nome: gestorData.nome,
              avatar_url: gestorData.avatar_url
            })
          }

          // Buscar dados do cliente
          const { data: clienteProfileData } = await supabase
            .from('cliente_profiles')
            .select('email_cliente, nome_display, avatar_url')
            .eq('email_cliente', emailCliente)
            .maybeSingle()

          if (clienteProfileData) {
            setClienteProfile({
              email: clienteProfileData.email_cliente,
              nome: clienteProfileData.nome_display || 'Cliente',
              avatar_url: clienteProfileData.avatar_url
            })
          } else {
            // Se não tem perfil, buscar nome na tabela todos_clientes
            const { data: clienteData } = await supabase
              .from('todos_clientes')
              .select('email_cliente, nome_cliente')
              .eq('email_cliente', emailCliente)
              .maybeSingle()

            if (clienteData) {
              setClienteProfile({
                email: clienteData.email_cliente,
                nome: clienteData.nome_cliente || 'Cliente',
                avatar_url: null
              })
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar perfis:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [emailCliente, emailGestor])

  // Retornar baseado nos parâmetros
  if (!emailCliente && !emailGestor) {
    return {
      gestorProfiles,
      loading,
      error
    }
  } else {
    return {
      gestorProfile,
      clienteProfile,
      loading
    }
  }
}
