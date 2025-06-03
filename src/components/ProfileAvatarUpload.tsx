
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Upload, Trash2, User } from 'lucide-react'
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
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const newUrl = await uploadProfilePicture(selectedFile, userType)
    if (newUrl) {
      onAvatarChange?.(newUrl)
      setOpen(false)
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }

  const handleDelete = async () => {
    const success = await deleteProfilePicture(userType)
    if (success) {
      onAvatarChange?.(null)
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    setOpen(false)
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
              >
                <Camera className="h-3 w-3" />
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
                      <Trash2 className="h-4 w-4" />
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
                      {uploading ? "Uploading..." : "Salvar Foto"}
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
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  )
}
