
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Phone, Mail, Calendar, Globe, Hash } from 'lucide-react'
import { Cliente } from '@/lib/supabase'

interface ClientesTableCardsProps {
  clientes: Cliente[]
  getStatusColor: (status: string) => string
  formatDate: (dateString: string) => string
}

export function ClientesTableCards({ clientes, getStatusColor, formatDate }: ClientesTableCardsProps) {
  return (
    <div className="grid gap-4 p-4">
      {clientes.map((cliente, index) => (
        <Card key={cliente.id} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header com nome e status */}
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-card-foreground truncate">
                  {cliente.nome_cliente}
                </h3>
                <Badge className={getStatusColor(cliente.status_campanha || 'Cliente Novo')}>
                  {cliente.status_campanha || 'Cliente Novo'}
                </Badge>
              </div>

              {/* Informações de contato */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{cliente.telefone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{cliente.email_cliente || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(cliente.data_venda || cliente.created_at)}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Materiais
                </Button>
                {cliente.link_site && (
                  <Button size="sm" variant="outline">
                    <Globe className="h-3 w-3 mr-1" />
                    Site
                  </Button>
                )}
                {cliente.numero_bm && (
                  <Button size="sm" variant="outline">
                    <Hash className="h-3 w-3 mr-1" />
                    BM
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
