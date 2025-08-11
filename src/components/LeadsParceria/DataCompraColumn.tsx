import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DataCompraColumnProps {
  lead: any;
  activeTab: 'leads' | 'compraram';
}

export function DataCompraColumn({ lead, activeTab }: DataCompraColumnProps) {
  if (activeTab !== 'compraram') {
    return (
      <TableCell>
        <div className="text-sm">
          <div className="font-medium">
            {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          <div className="text-muted-foreground">
            {format(new Date(lead.created_at), 'HH:mm', { locale: ptBR })}
          </div>
        </div>
      </TableCell>
    );
  }

  // Para a aba "Compraram", mostrar data da compra
  const dataCompra = lead.webhook_data_compra || lead.data_compra;
  const isWebhook = !!lead.webhook_data_compra;
  
  if (!dataCompra) {
    return (
      <TableCell>
        <div className="text-sm text-muted-foreground">
          Sem data de compra
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <div className="text-sm">
        <div className="font-medium">
          {format(new Date(dataCompra), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
        <div className="text-muted-foreground">
          {format(new Date(dataCompra), 'HH:mm', { locale: ptBR })}
        </div>
        {isWebhook && (
          <Badge variant="outline" className="text-xs mt-1 bg-green-50 text-green-700 border-green-200">
            Webhook
          </Badge>
        )}
      </div>
    </TableCell>
  );
}