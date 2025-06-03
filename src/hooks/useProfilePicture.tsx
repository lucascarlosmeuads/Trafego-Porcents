
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface UseProfilePictureReturn {
  uploading: boolean
  uploadProfilePicture: (file: File, userType: 'gestor' | 'cliente') => Promise<string | null>
  deleteProfilePicture: (userType: 'gestor' | 'cliente') => Promise<boolean>
}

export function useProfilePicture(): UseProfilePictureReturn {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)

  const uploadProfilePicture = async (file: File, userType: 'gestor' | 'cliente'): Promise<string | null> => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      })
      return null
    }

    setUploading(true)

    try {
      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos')
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('Arquivo muito grande. Máximo 5MB')
      }

      // Gerar nome único para o arquivo usando email como identificador
      const fileExt = file.name.split('.').pop()
      const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `${sanitizedEmail}/avatar.${fileExt}`

      console.log('🔄 [useProfilePicture] Fazendo upload:', fileName)

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('❌ [useProfilePicture] Erro no upload:', uploadError)
        throw uploadError
      }

      console.log('✅ [useProfilePicture] Upload realizado:', uploadData)

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      console.log('✅ [useProfilePicture] URL pública:', publicUrl)

      // Atualizar no banco de dados
      if (userType === 'gestor') {
        const { error: updateError } = await supabase
          .from('gestores')
          .update({ avatar_url: publicUrl })
          .eq('email', user.email)

        if (updateError) {
          console.error('❌ [useProfilePicture] Erro ao atualizar gestor:', updateError)
          throw updateError
        }
      } else {
        // Para clientes, criar ou atualizar perfil
        const { error: upsertError } = await supabase
          .from('cliente_profiles')
          .upsert({
            email_cliente: user.email,
            avatar_url: publicUrl
          })

        if (upsertError) {
          console.error('❌ [useProfilePicture] Erro ao atualizar cliente:', upsertError)
          throw upsertError
        }
      }

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso"
      })

      return publicUrl

    } catch (error: any) {
      console.error('❌ [useProfilePicture] Erro geral:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload da foto",
        variant: "destructive"
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const deleteProfilePicture = async (userType: 'gestor' | 'cliente'): Promise<boolean> => {
    if (!user?.email) return false

    try {
      // Remover do storage
      const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `${sanitizedEmail}/avatar.jpg`
      await supabase.storage
        .from('profile-pictures')
        .remove([fileName])

      // Atualizar no banco
      if (userType === 'gestor') {
        await supabase
          .from('gestores')
          .update({ avatar_url: null })
          .eq('email', user.email)
      } else {
        await supabase
          .from('cliente_profiles')
          .upsert({
            email_cliente: user.email,
            avatar_url: null
          })
      }

      toast({
        title: "Sucesso!",
        description: "Foto de perfil removida"
      })

      return true
    } catch (error) {
      console.error('❌ [useProfilePicture] Erro ao remover foto:', error)
      return false
    }
  }

  return {
    uploading,
    uploadProfilePicture,
    deleteProfilePicture
  }
}
