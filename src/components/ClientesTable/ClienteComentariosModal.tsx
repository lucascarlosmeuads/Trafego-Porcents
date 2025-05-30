
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, MessageCircle, Plus } from 'lucide-react'
import { ComentarioItem } from './ComentarioItem'
import { useComentariosCliente } from '@/hooks/useComentariosCliente'
import { useAuth } from '@/hooks/useAuth'

interface ClienteComentariosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteId: string
  nomeCliente: string
  triggerElement?: React.ReactNode
}

export function ClienteComentariosModal({
  open,
  onOpenChange,
  clienteId,
  nomeCliente,
  triggerElement
}: ClienteComentariosModalProps) {
  const { user } = useAuth()
  const [novoComentario, setNovoComentario] = useState('')
  
  const {
    comentarios,
    loading,
    submitting,
    adicionarComentario,
    marcarComoLido
  } = useComentariosCliente(clienteId)

  const handleAdicionarComentario = async () => {
    if (!novoComentario.trim() || !user?.email) return

    const sucesso = await adicionarComentario(novoComentario, user.email)
    if (sucesso) {
      setNovoComentario('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerElement}
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Comentários - {nomeCliente}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Lista de comentários */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando comentários...</span>
              </div>
            ) : comentarios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum comentário ainda.</p>
                <p className="text-sm">Adicione o primeiro comentário abaixo.</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {comentarios.map((comentario) => (
                    <ComentarioItem
                      key={comentario.id}
                      comentario={comentario}
                      onMarcarLido={marcarComoLido}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Adicionar novo comentário */}
          <div className="border-t pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Adicionar novo comentário:
              </label>
              <Textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Digite seu comentário aqui..."
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleAdicionarComentario()
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Pressione Ctrl+Enter para enviar rapidamente
                </span>
                <Button
                  onClick={handleAdicionarComentario}
                  disabled={!novoComentario.trim() || submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? 'Enviando...' : 'Adicionar Comentário'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
