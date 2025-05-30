
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { Comentario } from '@/hooks/useComentariosCliente'

interface ComentarioItemProps {
  comentario: Comentario
  onMarcarLido: (id: string) => void
}

export function ComentarioItem({ comentario, onMarcarLido }: ComentarioItemProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${
      comentario.lido 
        ? 'bg-muted/50 border-muted' 
        : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comentario.autor}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comentario.created_at)}
            </span>
            {!comentario.lido && (
              <Badge variant="destructive" className="text-xs px-2 py-0">
                Novo
              </Badge>
            )}
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {comentario.comentario}
          </p>
        </div>
        {!comentario.lido && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMarcarLido(comentario.id)}
            className="flex items-center gap-1 h-8 bg-green-600 hover:bg-green-700 border-green-600 text-white"
          >
            <Check className="h-3 w-3" />
            Entender
          </Button>
        )}
      </div>
    </div>
  )
}
