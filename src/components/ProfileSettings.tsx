
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { ProfileAvatarUpload } from './ProfileAvatarUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface ProfileSettingsProps {
  userType: 'gestor' | 'cliente'
}

export function ProfileSettings({ userType }: ProfileSettingsProps) {
  const { user, currentManagerName } = useAuth()
  const { profileData, updateProfileData } = useProfileData(userType)
  const [displayName, setDisplayName] = useState(profileData?.nome_display || currentManagerName || '')
  const [saving, setSaving] = useState(false)

  const handleSaveDisplayName = async () => {
    if (!user?.email) return

    setSaving(true)
    try {
      if (userType === 'gestor') {
        const { error } = await supabase
          .from('gestores')
          .update({ nome: displayName })
          .eq('email', user.email)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cliente_profiles')
          .upsert({
            email_cliente: user.email,
            nome_display: displayName
          })

        if (error) throw error
      }

      updateProfileData({ nome_display: displayName })
      toast({
        title: "Sucesso!",
        description: "Nome atualizado com sucesso"
      })
    } catch (error: any) {
      console.error('Erro ao atualizar nome:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar nome",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = (newUrl: string | null) => {
    updateProfileData({ avatar_url: newUrl })
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurações do Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas informações pessoais e foto de perfil
        </p>
      </div>

      {/* Foto de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>
            Atualize sua foto de perfil. Recomendamos imagens quadradas de pelo menos 200x200 pixels.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <ProfileAvatarUpload
            currentAvatarUrl={profileData?.avatar_url}
            userName={profileData?.nome_display || currentManagerName || 'Usuário'}
            userType={userType}
            onAvatarChange={handleAvatarChange}
            size="lg"
            showEditButton={true}
          />
          <p className="text-sm text-gray-500 text-center max-w-md">
            Clique no ícone da câmera para atualizar sua foto. 
            Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB.
          </p>
        </CardContent>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize suas informações básicas de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500">
              O e-mail não pode ser alterado.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nome de Exibição</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Digite seu nome"
              />
              <Button 
                onClick={handleSaveDisplayName}
                disabled={saving || displayName === (profileData?.nome_display || currentManagerName)}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Usuário</Label>
            <Input
              value={userType === 'gestor' ? 'Gestor' : 'Cliente'}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
