
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { type Cliente } from '@/lib/supabase'

interface DeleteClientButtonProps {
  cliente: Cliente
  onDelete: (clienteId: string) => Promise<boolean>
  isDeleting: boolean
}

export function DeleteClientButton({ cliente, onDelete, isDeleting }: DeleteClientButtonProps) {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    const success = await onDelete(cliente.id)
    if (success) {
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o cliente <strong>{cliente.nome_cliente}</strong>?
            <br />
            <span className="text-xs text-muted-foreground">
              Email: {cliente.email_cliente}
            </span>
            <br />
            <br />
            <strong className="text-destructive">Esta ação não pode ser desfeita.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Cliente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
