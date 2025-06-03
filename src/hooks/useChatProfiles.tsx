
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  email: string
  nome: string
  avatar_url?: string | null
}

interface UseChatProfilesReturn {
  gestorProfile: ProfileData | null
  clienteProfile: ProfileData | null
  loading: boolean
}

export function useChatProfiles(emailCliente: string, emailGestor: string): UseChatProfilesReturn {
  const [gestorProfile, setGestorProfile] = useState<ProfileData | null>(null)
  const [clienteProfile, setClienteProfile] = useState<ProfileData | null>(null)
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

        // Buscar dados do cliente (primeiro verificar se existe perfil)
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
