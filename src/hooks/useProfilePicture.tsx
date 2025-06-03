
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
      console.error('❌ [useProfilePicture] Usuário não autenticado')
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      })
      return null
    }

    console.log('🔄 [useProfilePicture] Iniciando upload para:', { email: user.email, userType })
    setUploading(true)

    try {
      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos')
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('Arquivo muito grande. Máximo 5MB')
      }

      // Gerar nome único usando email como identificador (sanitizado)
      const fileExt = file.name.split('.').pop()
      const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `${sanitizedEmail}/avatar.${fileExt}`

      console.log('📁 [useProfilePicture] Nome do arquivo:', fileName)

      // Primeiro, tentar deletar arquivo existente (se houver)
      try {
        await supabase.storage
          .from('profile-pictures')
          .remove([fileName])
        console.log('🗑️ [useProfilePicture] Arquivo anterior removido (se existia)')
      } catch (deleteError) {
        console.log('ℹ️ [useProfilePicture] Nenhum arquivo anterior para deletar ou erro ignorável:', deleteError)
      }

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        })

      if (uploadError) {
        console.error('❌ [useProfilePicture] Erro no upload:', uploadError)
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      console.log('✅ [useProfilePicture] Upload realizado com sucesso:', uploadData)

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      console.log('🔗 [useProfilePicture] URL pública gerada:', publicUrl)

      // Atualizar no banco de dados
      if (userType === 'gestor') {
        console.log('📝 [useProfilePicture] Atualizando tabela gestores...')
        
        const { error: updateError } = await supabase
          .from('gestores')
          .update({ avatar_url: publicUrl })
          .eq('email', user.email)

        if (updateError) {
          console.error('❌ [useProfilePicture] Erro ao atualizar gestor:', updateError)
          throw new Error(`Erro ao atualizar perfil: ${updateError.message}`)
        }
        
        console.log('✅ [useProfilePicture] Tabela gestores atualizada com sucesso')
      } else {
        console.log('📝 [useProfilePicture] Atualizando tabela cliente_profiles...')
        
        // Para clientes, criar ou atualizar perfil
        const { error: upsertError } = await supabase
          .from('cliente_profiles')
          .upsert({
            email_cliente: user.email,
            avatar_url: publicUrl
          })

        if (upsertError) {
          console.error('❌ [useProfilePicture] Erro ao atualizar cliente:', upsertError)
          throw new Error(`Erro ao atualizar perfil: ${upsertError.message}`)
        }
        
        console.log('✅ [useProfilePicture] Tabela cliente_profiles atualizada com sucesso')
      }

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso"
      })

      console.log('🎉 [useProfilePicture] Upload completo com sucesso!')
      return publicUrl

    } catch (error: any) {
      console.error('❌ [useProfilePicture] Erro geral no upload:', {
        message: error.message,
        details: error,
        userType,
        userEmail: user.email
      })
      
      toast({
        title: "Erro no Upload",
        description: error.message || "Erro ao fazer upload da foto. Tente novamente.",
        variant: "destructive"
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const deleteProfilePicture = async (userType: 'gestor' | 'cliente'): Promise<boolean> => {
    if (!user?.email) {
      console.error('❌ [useProfilePicture] Usuário não autenticado para deletar')
      return false
    }

    console.log('🗑️ [useProfilePicture] Deletando foto de perfil:', { email: user.email, userType })

    try {
      // Gerar nome do arquivo para deletar
      const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9]/g, '_')
      
      // Tentar deletar diferentes extensões possíveis
      const possibleExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      
      for (const ext of possibleExtensions) {
        const fileName = `${sanitizedEmail}/avatar.${ext}`
        try {
          await supabase.storage
            .from('profile-pictures')
            .remove([fileName])
          console.log(`🗑️ [useProfilePicture] Arquivo ${fileName} removido`)
        } catch (error) {
          // Ignorar erros de arquivo não encontrado
          console.log(`ℹ️ [useProfilePicture] Arquivo ${fileName} não encontrado ou já removido`)
        }
      }

      // Atualizar no banco
      if (userType === 'gestor') {
        const { error: updateError } = await supabase
          .from('gestores')
          .update({ avatar_url: null })
          .eq('email', user.email)
          
        if (updateError) {
          console.error('❌ [useProfilePicture] Erro ao limpar avatar_url do gestor:', updateError)
          throw updateError
        }
      } else {
        const { error: updateError } = await supabase
          .from('cliente_profiles')
          .upsert({
            email_cliente: user.email,
            avatar_url: null
          })
          
        if (updateError) {
          console.error('❌ [useProfilePicture] Erro ao limpar avatar_url do cliente:', updateError)
          throw updateError
        }
      }

      toast({
        title: "Sucesso!",
        description: "Foto de perfil removida"
      })

      console.log('✅ [useProfilePicture] Foto deletada com sucesso')
      return true
    } catch (error: any) {
      console.error('❌ [useProfilePicture] Erro ao remover foto:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover foto de perfil",
        variant: "destructive"
      })
      return false
    }
  }

  return {
    uploading,
    uploadProfilePicture,
    deleteProfilePicture
  }
}
