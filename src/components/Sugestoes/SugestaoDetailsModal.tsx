
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  Lightbulb, 
  User, 
  Calendar, 
  Send, 
  CheckCircle, 
  XCircle, 
  Eye,
  Clock,
  AlertTriangle 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SugestaoMelhoria } from '@/hooks/useSugestoesMelhorias'

interface SugestaoDetailsModalProps {
  sugestao: SugestaoMelhoria
  onClose: () => void
  onResponder: (id: string, resposta: string, status: SugestaoMelhoria['status']) => Promise<boolean>
  onAtualizarStatus: (id: string, updates: Partial<SugestaoMelhoria>) => Promise<boolean>
}

export function SugestaoDetailsModal({ sugestao, onClose, onResponder, onAtualizarStatus }: SugestaoDetailsModalProps) {
  const [resposta, setResposta] = useState(sugestao.resposta_admin || '')
  const [novoStatus, setNovoStatus] = useState<SugestaoMelhoria['status']>(sugestao.status)
  const [loading, setLoading] = useState(false)

  const statusOptions = [
    { value: 'pendente', label: 'Pendente', icon: Clock, color: 'text-yellow-600' },
    { value: 'em_analise', label: 'Em Análise', icon: Eye, color: 'text-blue-600' },
    { value: 'aprovada', label: 'Aprovada', icon: CheckCircle, color: 'text-green-600' },
    { value: 'rejeitada', label: 'Rejeitada', icon: XCircle, color: 'text-red-600' },
    { value: 'implementada', label: 'Implementada', icon: CheckCircle, color: 'text-purple-600' }
  ]

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'interface': return 'Interface/Design'
      case 'funcionalidade': return 'Nova Funcionalidade'
      case 'performance': return 'Performance'
      case 'bug': return 'Correção de Bug'
      case 'outros': return 'Outros'
      default: return categoria
    }
  }

  const getCategoriaIcon = (categoria: string) => {
    if (categoria === 'bug') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleResponder = async () => {
    if (!resposta.trim()) return

    setLoading(true)
    const sucesso = await onResponder(sugestao.id, resposta.trim(), novoStatus)
    
    if (sucesso) {
      onClose()
    }
    
    setLoading(false)
  }

  const handleAtualizarStatus = async () => {
    if (novoStatus === sugestao.status) return

    setLoading(true)
    const sucesso = await onAtualizarStatus(sugestao.id, { status: novoStatus })
    
    if (sucesso) {
      onClose()
    }
    
    setLoading(false)
  }

  const statusAtual = statusOptions.find(s => s.value === sugestao.status)
  const StatusIcon = statusAtual?.icon || Clock

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Detalhes da Sugestão
          </DialogTitle>
          <DialogDescription>
            Analise e responda à sugestão do gestor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Sugestão */}
          <div className="space-y-4">
            {/* Header com badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusAtual?.label || sugestao.status}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getCategoriaIcon(sugestao.categoria)}
                {getCategoriaLabel(sugestao.categoria)}
              </Badge>
              <Badge variant="outline" className={getPrioridadeColor(sugestao.prioridade)}>
                Prioridade {sugestao.prioridade.charAt(0).toUpperCase() + sugestao.prioridade.slice(1)}
              </Badge>
            </div>

            {/* Título */}
            <h3 className="text-xl font-semibold text-gray-900">
              {sugestao.titulo}
            </h3>

            {/* Informações do Gestor */}
            <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{sugestao.gestor_nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>{sugestao.gestor_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(sugestao.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Descrição da Sugestão
              </Label>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {sugestao.descricao}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção de Resposta do Admin */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-900">
              Resposta do Administrador
            </Label>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Alterar Status</Label>
              <Select value={novoStatus} onValueChange={(value: SugestaoMelhoria['status']) => setNovoStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => {
                    const Icon = status.icon
                    return (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${status.color}`} />
                          <span>{status.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Resposta */}
            <div className="space-y-2">
              <Label htmlFor="resposta">Feedback/Resposta</Label>
              <Textarea
                id="resposta"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Escreva seu feedback sobre a sugestão..."
                rows={6}
                disabled={loading}
              />
              <div className="text-xs text-gray-500">
                Forneça um feedback detalhado sobre a avaliação da sugestão.
              </div>
            </div>

            {/* Resposta anterior (se existir) */}
            {sugestao.resposta_admin && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="font-medium text-blue-900">Resposta Anterior</span>
                  {sugestao.respondido_em && (
                    <span className="text-sm text-blue-600">
                      • {formatDistanceToNow(new Date(sugestao.respondido_em), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  )}
                </div>
                <p className="text-blue-800">{sugestao.resposta_admin}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Fechar
          </Button>
          
          {novoStatus !== sugestao.status && !resposta.trim() && (
            <Button 
              onClick={handleAtualizarStatus} 
              disabled={loading}
              variant="secondary"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Atualizando...
                </div>
              ) : (
                'Atualizar Status'
              )}
            </Button>
          )}
          
          {resposta.trim() && (
            <Button onClick={handleResponder} disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Resposta
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
