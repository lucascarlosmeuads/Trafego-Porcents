
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
          console.log('🔍 [useProfileData] Buscando dados do gestor:', user.email)
          
          const { data, error } = await supabase
            .from('gestores')
            .select('avatar_url, nome')
            .eq('email', user.email)
            .maybeSingle()

          if (error) {
            console.error('❌ [useProfileData] Erro ao buscar gestor:', error)
          }

          if (data) {
            console.log('✅ [useProfileData] Dados do gestor encontrados:', data)
            setProfileData({
              avatar_url: data.avatar_url,
              nome_display: data.nome
            })
          } else {
            console.warn('⚠️ [useProfileData] Nenhum dado encontrado para o gestor')
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
        console.error('❌ [useProfileData] Erro ao buscar dados do perfil:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user?.email, userType])

  const updateProfileData = (newData: Partial<ProfileData>) => {
    console.log('🔄 [useProfileData] Atualizando dados do perfil:', newData)
    setProfileData(prev => prev ? { ...prev, ...newData } : newData)
  }

  return {
    profileData,
    loading,
    updateProfileData
  }
}
