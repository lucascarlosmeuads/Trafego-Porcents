
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Clock, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DashboardRefreshButtonProps {
  onRefresh: () => Promise<void>
  lastUpdated?: Date
}

export function DashboardRefreshButton({ onRefresh, lastUpdated }: DashboardRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
      toast({
        title: "✅ Dashboard atualizado",
        description: "Todos os dados foram atualizados com sucesso!",
      })
    } catch (error) {
      toast({
        title: "❌ Erro na atualização",
        description: "Não foi possível atualizar os dados. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatLastUpdated = (date?: Date) => {
    if (!date) return 'Nunca atualizado'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `${diffMins} min atrás`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Última atualização: {formatLastUpdated(lastUpdated)}
              </span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs">Sincronizado</span>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Dashboard'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
