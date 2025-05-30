
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'
import { ClienteComentariosModal } from './ClienteComentariosModal'
import { useComentariosCliente } from '@/hooks/useComentariosCliente'

interface ClienteRowNameProps {
  clienteId: string
  nomeCliente: string
}

export function ClienteRowName({ clienteId, nomeCliente }: ClienteRowNameProps) {
  const [comentariosModalOpen, setComentariosModalOpen] = useState(false)
  const { comentariosNaoLidos } = useComentariosCliente(clienteId)

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="truncate" title={nomeCliente || ''}>
          {nomeCliente || 'Não informado'}
        </div>
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-blue-600/20"
            onClick={() => setComentariosModalOpen(true)}
            title="Ver comentários"
          >
            <MessageCircle className="h-4 w-4 text-blue-400" />
          </Button>
          {comentariosNaoLidos > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {comentariosNaoLidos}
            </Badge>
          )}
        </div>
      </div>

      <ClienteComentariosModal
        open={comentariosModalOpen}
        onOpenChange={setComentariosModalOpen}
        clienteId={clienteId}
        nomeCliente={nomeCliente || 'Cliente'}
      />
    </>
  )
}
