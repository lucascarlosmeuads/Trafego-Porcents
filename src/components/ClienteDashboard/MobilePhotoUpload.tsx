
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Check, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MobilePhotoUploadProps {
  currentAvatarUrl?: string | null
  userName: string
  userType: 'cliente' | 'gestor'
  onAvatarChange: (url: string | null) => void
  onComplete?: () => void
}

export function MobilePhotoUpload({
  currentAvatarUrl,
  userName,
  userType,
  onAvatarChange,
  onComplete
}: MobilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const { toast } = useToast()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Criar preview local
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Simular upload (aqui você integraria com o Supabase Storage)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Por enquanto, usar o preview local como URL
      const mockUrl = URL.createObjectURL(file)
      onAvatarChange(mockUrl)
      
      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso.",
      })
      
      if (onComplete) {
        setTimeout(onComplete, 500)
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem. Tente novamente.",
        variant: "destructive",
      })
      setPreviewUrl(currentAvatarUrl)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    onAvatarChange(null)
    toast({
      title: "Foto removida",
      description: "Sua foto de perfil foi removida.",
    })
    if (onComplete) {
      setTimeout(onComplete, 500)
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview da Foto */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-gray-600">
            <AvatarImage src={previewUrl || undefined} alt={userName} />
            <AvatarFallback className="bg-gray-700 text-white text-xl">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-white font-medium">{userName}</p>
          <p className="text-gray-400 text-sm">
            {previewUrl ? 'Foto atual' : 'Nenhuma foto'}
          </p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3"
            disabled={isUploading}
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Fazendo upload...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                {previewUrl ? 'Trocar Foto' : 'Adicionar Foto'}
              </>
            )}
          </Button>
        </div>

        {previewUrl && (
          <Button
            onClick={handleRemovePhoto}
            variant="outline"
            className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white py-3"
            disabled={isUploading}
            size="lg"
          >
            <X className="h-4 w-4 mr-2" />
            Remover Foto
          </Button>
        )}

        {previewUrl && (
          <Button
            onClick={onComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            size="lg"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar
          </Button>
        )}
      </div>

      {/* Dicas */}
      <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
        <h4 className="text-blue-300 font-medium text-sm mb-2">💡 Dicas para uma boa foto:</h4>
        <ul className="text-blue-200 text-xs space-y-1">
          <li>• Use uma foto clara e bem iluminada</li>
          <li>• Prefira fotos com fundo simples</li>
          <li>• Evite fotos muito escuras ou desfocadas</li>
          <li>• Máximo 5MB de tamanho</li>
        </ul>
      </div>
    </div>
  )
}
