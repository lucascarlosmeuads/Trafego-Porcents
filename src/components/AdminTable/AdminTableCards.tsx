
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cliente } from '@/lib/supabase'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'
import { TransferirModal } from './TransferirModal'
import { ComissaoSimples } from '@/components/ClientesTable/ComissaoSimples'

interface AdminTableCardsProps {
  clientes: Cliente[]
  gestores: Array<{ email: string, nome: string }>
  transferindoCliente: string | null
  onTransferirCliente: (clienteId: string, novoEmailGestor: string) => void
  onComissionUpdate: () => void
  formatDate: (dateString: string | null) => string
  getStatusColor: (status: string) => string
}

export function AdminTableCards({ 
  clientes, 
  gestores, 
  transferindoCliente, 
  onTransferirCliente, 
  onComissionUpdate,
  formatDate, 
  getStatusColor 
}: AdminTableCardsProps) {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 lg:hidden">
      {clientes.map((cliente) => {
        const dataLimiteDisplay = getDataLimiteDisplayForGestor(
          cliente.data_venda || '', 
          cliente.created_at, 
          cliente.status_campanha || ''
        )
        
        return (
          <Card key={cliente.id} className="w-full bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between text-card-foreground">
                <span className="truncate">{cliente.nome_cliente || 'Cliente sem nome'}</span>
                <span className="text-xs font-mono text-muted-foreground">#{cliente.id}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Telefone:</span>
                <span className="ml-2 text-card-foreground">{cliente.telefone || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Email Gestor:</span>
                <span className="ml-2 text-card-foreground">{cliente.email_gestor || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha)}`}>
                  {cliente.status_campanha || 'Sem status'}
                </span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Data Venda:</span>
                <span className="ml-2 text-card-foreground">{formatDate(cliente.data_venda)}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Data Limite:</span>
                <span className={`ml-2 text-xs font-medium ${dataLimiteDisplay.classeCor}`}>
                  {dataLimiteDisplay.texto}
                </span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Comissão:</span>
                <div className="mt-1">
                  <ComissaoSimples
                    cliente={cliente}
                    isAdmin={true}
                    onComissionUpdate={onComissionUpdate}
                    compact={true}
                  />
                </div>
              </div>
              <div className="pt-2">
                <TransferirModal
                  cliente={cliente}
                  onTransferirCliente={onTransferirCliente}
                  isLoading={transferindoCliente === String(cliente.id)}
                  gestores={gestores}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
