
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cliente } from '@/lib/supabase'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'
import { TransferirModal } from './TransferirModal'

interface AdminTableCardsProps {
  clientes: Cliente[]
  gestores: Array<{ email: string, nome: string }>
  transferindoCliente: string | null
  onTransferirCliente: (clienteId: string, novoEmailGestor: string) => void
  formatDate: (dateString: string | null) => string
  getStatusColor: (status: string) => string
}

export function AdminTableCards({ 
  clientes, 
  gestores, 
  transferindoCliente, 
  onTransferirCliente, 
  formatDate, 
  getStatusColor 
}: AdminTableCardsProps) {
  return (
    <div className="grid gap-6 p-6 md:grid-cols-2 lg:hidden">
      {clientes.map((cliente) => {
        const dataLimiteDisplay = getDataLimiteDisplayForGestor(
          cliente.data_venda || '', 
          cliente.created_at, 
          cliente.status_campanha || ''
        )
        
        return (
          <Card key={cliente.id} className="w-full bg-admin-card border-admin-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center justify-between text-admin-text-primary">
                <span className="truncate font-semibold">{cliente.nome_cliente || 'Cliente sem nome'}</span>
                <span className="text-xs font-mono text-admin-text-secondary bg-admin-border/20 px-2 py-1 rounded">
                  #{cliente.id}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-admin-text-info block mb-1">Telefone:</span>
                  <span className="text-admin-text-primary">{cliente.telefone || '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-admin-text-info block mb-1">Data Venda:</span>
                  <span className="text-admin-text-primary">{formatDate(cliente.data_venda)}</span>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-admin-text-info block mb-2">Email Gestor:</span>
                <span className="text-admin-text-primary bg-admin-border/10 px-3 py-1 rounded-lg text-xs">
                  {cliente.email_gestor || '-'}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-admin-text-info block mb-2">Status:</span>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(cliente.status_campanha)}`}>
                  {cliente.status_campanha || 'Sem status'}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-admin-text-info block mb-2">Data Limite:</span>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${dataLimiteDisplay.classeCor}`}>
                  {dataLimiteDisplay.texto}
                </span>
              </div>
              
              <div className="pt-4 border-t border-admin-border">
                <TransferirModal
                  cliente={cliente}
                  onTransferirCliente={onTransferirCliente}
                  isLoading={transferindoCliente === cliente.id}
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
