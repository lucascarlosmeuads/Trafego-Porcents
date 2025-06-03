
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface ProfileData {
  avatar_url?: string | null
  nome_display?: string | null
}

export function useProfileData(userType: 'gestor' | 'cliente') {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        if (userType === 'gestor') {
          const { data, error } = await supabase
            .from('gestores')
            .select('avatar_url, nome')
            .eq('email', user.email)
            .single()

          if (!error && data) {
            setProfileData({
              avatar_url: data.avatar_url,
              nome_display: data.nome
            })
          }
        } else {
          const { data, error } = await supabase
            .from('cliente_profiles')
            .select('avatar_url, nome_display')
            .eq('email_cliente', user.email)
            .maybeSingle()

          if (!error && data) {
            setProfileData(data)
          } else {
            // Se não existe perfil, buscar nome na tabela todos_clientes
            const { data: clienteData, error: clienteError } = await supabase
              .from('todos_clientes')
              .select('nome_cliente')
              .eq('email_cliente', user.email)
              .maybeSingle()

            if (!clienteError && clienteData) {
              setProfileData({
                avatar_url: null,
                nome_display: clienteData.nome_cliente
              })
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user?.email, userType])

  const updateProfileData = (newData: Partial<ProfileData>) => {
    setProfileData(prev => prev ? { ...prev, ...newData } : newData)
  }

  return {
    profileData,
    loading,
    updateProfileData
  }
}
