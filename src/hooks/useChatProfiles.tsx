
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface GestorProfile {
  email: string
  nome_gestor: string
  avatar_url?: string | null
}

interface UseChatProfilesReturn {
  gestorProfiles: GestorProfile[]
  loading: boolean
  error: string | null
}

export function useChatProfiles(): UseChatProfilesReturn {
  const [gestorProfiles, setGestorProfiles] = useState<GestorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGestorProfiles = async () => {
      try {
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
      } catch (err) {
        console.error('Erro ao buscar perfis de gestores:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchGestorProfiles()
  }, [])

  return {
    gestorProfiles,
    loading,
    error
  }
}

// Manter a versão original do hook para compatibilidade com outros componentes
export function useChatProfiles(emailCliente: string, emailGestor: string) {
  const [gestorProfile, setGestorProfile] = useState<any>(null)
  const [clienteProfile, setClienteProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!emailCliente || !emailGestor) {
        setLoading(false)
        return
      }

      try {
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

      } catch (error) {
        console.error('❌ [useChatProfiles] Erro ao buscar perfis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [emailCliente, emailGestor])

  return {
    gestorProfile,
    clienteProfile,
    loading
  }
}
