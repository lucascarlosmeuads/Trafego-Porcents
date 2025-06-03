
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Upload, Trash2, User, Loader2 } from 'lucide-react'
import { useProfilePicture } from '@/hooks/useProfilePicture'

interface ProfileAvatarUploadProps {
  currentAvatarUrl?: string | null
  userName: string
  userType: 'gestor' | 'cliente'
  onAvatarChange?: (newUrl: string | null) => void
  size?: 'sm' | 'md' | 'lg'
  showEditButton?: boolean
}

export function ProfileAvatarUpload({ 
  currentAvatarUrl, 
  userName, 
  userType,
  onAvatarChange,
  size = 'md',
  showEditButton = true
}: ProfileAvatarUploadProps) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploading, uploadProfilePicture, deleteProfilePicture } = useProfilePicture()

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('📁 [ProfileAvatarUpload] Arquivo selecionado:', file.name, file.type, file.size)
      
      // Validar arquivo antes de criar preview
      if (!file.type.startsWith('image/')) {
        console.error('❌ [ProfileAvatarUpload] Tipo de arquivo inválido:', file.type)
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        console.error('❌ [ProfileAvatarUpload] Arquivo muito grande:', file.size)
        return
      }
      
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('👁️ [ProfileAvatarUpload] Preview criado')
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      console.warn('⚠️ [ProfileAvatarUpload] Nenhum arquivo selecionado')
      return
    }

    console.log('🚀 [ProfileAvatarUpload] Iniciando upload...', {
      fileName: selectedFile.name,
      userType,
      userName
    })

    const newUrl = await uploadProfilePicture(selectedFile, userType)
    if (newUrl) {
      console.log('✅ [ProfileAvatarUpload] Upload bem-sucedido:', newUrl)
      onAvatarChange?.(newUrl)
      setOpen(false)
      setPreviewUrl(null)
      setSelectedFile(null)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } else {
      console.error('❌ [ProfileAvatarUpload] Upload falhou')
    }
  }

  const handleDelete = async () => {
    console.log('🗑️ [ProfileAvatarUpload] Iniciando remoção de foto...')
    const success = await deleteProfilePicture(userType)
    if (success) {
      console.log('✅ [ProfileAvatarUpload] Foto removida com sucesso')
      onAvatarChange?.(null)
      setOpen(false)
    } else {
      console.error('❌ [ProfileAvatarUpload] Falha ao remover foto')
    }
  }

  const handleCancel = () => {
    console.log('↩️ [ProfileAvatarUpload] Upload cancelado')
    setPreviewUrl(null)
    setSelectedFile(null)
    setOpen(false)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <div className="relative group">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentAvatarUrl || undefined} alt={userName} />
          <AvatarFallback className="bg-gray-600 text-white">
            {getInitials(userName) || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        
        {showEditButton && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Atualizar Foto de Perfil</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={previewUrl || currentAvatarUrl || undefined} alt={userName} />
                    <AvatarFallback className="bg-gray-600 text-white text-lg">
                      {getInitials(userName) || <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Foto
                  </Button>

                  {currentAvatarUrl && (
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      disabled={uploading}
                      className="text-red-600 hover:text-red-700"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {selectedFile && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Foto"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={uploading}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Formatos aceitos: JPG, PNG, GIF. Máximo 5MB.
                </p>
                
                {uploading && (
                  <div className="text-center text-sm text-blue-600">
                    ⏳ Fazendo upload da foto...
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  )
}
