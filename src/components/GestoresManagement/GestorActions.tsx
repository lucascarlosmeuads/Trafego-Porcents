
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { UserPlus, UserMinus, Check, X, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { type Gestor } from '@/types/gestor'

interface GestorActionsProps {
  gestor: Gestor
  onUpdate: () => void
}

export function GestorActions({ gestor, onUpdate }: GestorActionsProps) {
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const togglePermissao = async (gestorId: string, currentPermission: boolean) => {
    try {
      console.log('🔄 Alterando permissão do gestor:', gestorId, 'para:', !currentPermission)
      
      const { error } = await supabase
        .from('gestores')
        .update({ pode_adicionar_cliente: !currentPermission })
        .eq('id', gestorId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Permissão ${!currentPermission ? 'concedida' : 'revogada'} com sucesso`
      })

      onUpdate()
    } catch (error) {
      console.error('💥 Erro ao alterar permissão:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar permissão",
        variant: "destructive"
      })
    }
  }

  const toggleStatus = async (gestorId: string, currentStatus: boolean) => {
    try {
      console.log('🔄 Alterando status do gestor:', gestorId, 'para:', !currentStatus)
      
      const { error } = await supabase
        .from('gestores')
        .update({ ativo: !currentStatus })
        .eq('id', gestorId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Gestor ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      })

      onUpdate()
    } catch (error) {
      console.error('💥 Erro ao alterar status:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteGestor = async () => {
    setDeleting(true)
    try {
      console.log('🗑️ [GESTORES] Iniciando exclusão completa do gestor:', gestor.email)

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado')
      }

      toast({
        title: "Processando...",
        description: "Removendo gestor do sistema e revogando acesso..."
      })

      const response = await fetch(`https://rxpgqunqsegypssoqpyf.supabase.co/functions/v1/delete-gestor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gestorId: gestor.id,
          email: gestor.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao excluir gestor')
      }

      if (!result.success) {
        throw new Error('Falha na exclusão do gestor')
      }

      console.log('✅ [GESTORES] Exclusão completa realizada!')
      console.log('🗑️ [GESTORES] Removido da tabela gestores:', result.deletedGestor.nome)
      console.log('🔐 [GESTORES] Removido do Auth:', result.deletedFromAuth ? 'Sim' : 'Não encontrado')

      const description = result.deletedFromAuth 
        ? "Gestor removido do sistema e acesso revogado completamente!"
        : "Gestor removido do sistema (não tinha acesso de login)"

      toast({
        title: "✅ Exclusão Completa",
        description: description
      })

      setTimeout(() => {
        onUpdate()
      }, 1000)

    } catch (error: any) {
      console.error('💥 [GESTORES] Erro na exclusão:', error)
      toast({
        title: "❌ Erro na Exclusão",
        description: error.message || "Erro ao excluir gestor e revogar acesso",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  const isDisabled = gestor.id.includes('fallback')

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant={gestor.pode_adicionar_cliente ? "destructive" : "default"}
        onClick={() => togglePermissao(gestor.id, gestor.pode_adicionar_cliente)}
        disabled={isDisabled}
      >
        {gestor.pode_adicionar_cliente ? (
          <>
            <UserMinus className="w-3 h-3 mr-1" />
            Revogar
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3 mr-1" />
            Permitir
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => toggleStatus(gestor.id, gestor.ativo)}
        disabled={isDisabled}
      >
        {gestor.ativo ? (
          <>
            <X className="w-3 h-3 mr-1" />
            Desativar
          </>
        ) : (
          <>
            <Check className="w-3 h-3 mr-1" />
            Ativar
          </>
        )}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            disabled={deleting || isDisabled}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente este gestor?
              <br /><br />
              <strong>Esta ação irá:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remover o gestor do painel de gerenciamento</li>
                <li>Remover o acesso ao sistema</li>
                <li>Excluir o usuário da autenticação</li>
                <li>Remover da sidebar de gestores</li>
              </ul>
              <br />
              <span className="text-red-600 font-medium">Esta ação não pode ser desfeita!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGestor}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
