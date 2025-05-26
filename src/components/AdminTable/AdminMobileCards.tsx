
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cliente } from '@/lib/supabase'
import { DeleteClientButton } from '../ClientesTable/DeleteClientButton'

interface AdminMobileCardsProps {
  clientes: Cliente[]
  onDeleteCliente: (clienteId: string) => Promise<boolean>
  deletingCliente: string | null
  formatDate: (dateString: string | null) => string
  getStatusColor: (status: string) => string
}

export function AdminMobileCards({
  clientes,
  onDeleteCliente,
  deletingCliente,
  formatDate,
  getStatusColor
}: AdminMobileCardsProps) {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 lg:hidden">
      {clientes.map((cliente) => (
        <Card key={cliente.id} className="w-full bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between text-card-foreground">
              <span className="truncate">{cliente.nome_cliente || 'Cliente sem nome'}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">#{cliente.id}</span>
                <DeleteClientButton
                  cliente={cliente}
                  onDelete={onDeleteCliente}
                  isDeleting={deletingCliente === cliente.id}
                />
              </div>
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
